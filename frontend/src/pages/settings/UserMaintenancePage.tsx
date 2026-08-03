import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  adminClearData,
  adminReseedData,
  createUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
  UserRow,
} from "../../services/api";
import { roleList } from "../../services/auth";

export function UserMaintenancePage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    employeeNo: "",
    displayName: "",
    email: "",
    department: "",
    team: "",
    position: "",
    businessUnit: "HIT",
    role: "Employee",
  });

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [rows]
  );

  const load = async () => {
    setError("");

    try {
      const data = await getUsers();
      setRows(data);
    } catch {
      setError("Unable to load users.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changeRole = async (row: UserRow, role: string) => {
    setMessage("");
    setError("");
    setBusy(true);

    try {
      await updateUserRole(row.id, role);
      setMessage(`Updated role for ${row.displayName}.`);
      await load();
    } catch {
      setError("Unable to update user role.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (row: UserRow) => {
    setMessage("");
    setError("");
    setBusy(true);

    try {
      await updateUserStatus(row.id, !row.isActive);
      setMessage(`${row.displayName} is now ${row.isActive ? "Inactive" : "Active"}.`);
      await load();
    } catch {
      setError("Unable to update user status.");
    } finally {
      setBusy(false);
    }
  };

  const saveCreate = async () => {
    if (!createForm.displayName.trim() || !createForm.email.trim()) {
      setError("Display name and email are required.");
      return;
    }

    setMessage("");
    setError("");
    setBusy(true);

    try {
      await createUser({
        employeeNo: createForm.employeeNo || undefined,
        displayName: createForm.displayName,
        email: createForm.email,
        department: createForm.department || "General",
        team: createForm.team || "General",
        position: createForm.position || "Staff",
        businessUnit: createForm.businessUnit || "HIT",
        role: createForm.role,
      });

      setMessage("User created.");
      setCreateOpen(false);
      setCreateForm({
        employeeNo: "",
        displayName: "",
        email: "",
        department: "",
        team: "",
        position: "",
        businessUnit: "HIT",
        role: "Employee",
      });
      await load();
    } catch {
      setError("Unable to create user.");
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    const confirmed = window.confirm("Clear the entire database? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setBusy(true);

    try {
      const result = await adminClearData();
      setMessage(result);
      await load();
    } catch {
      setError("Unable to clear database.");
    } finally {
      setBusy(false);
    }
  };

  const reseed = async () => {
    const confirmed = window.confirm("Reset and load the expanded example database?");
    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setBusy(true);

    try {
      const result = await adminReseedData();
      setMessage(result);
      await load();
    } catch {
      setError("Unable to reseed data. Ensure backend API is online.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          User Maintenance
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <Button variant="contained" onClick={() => setCreateOpen(true)} disabled={busy}>
            Add User
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => void reseed()} disabled={busy}>
            Load Expanded Example Data
          </Button>
          <Button variant="outlined" color="error" onClick={() => void clearAll()} disabled={busy}>
            Clear Entire Database
          </Button>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.employeeNo}</TableCell>
                    <TableCell>{row.displayName}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.team}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <TextField
                        select
                        size="small"
                        value={row.role}
                        onChange={(event) => {
                          void changeRole(row, event.target.value);
                        }}
                        disabled={busy}
                      >
                        {roleList.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.isActive ? "Active" : "Inactive"}
                        color={row.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="text" onClick={() => void toggleStatus(row)} disabled={busy}>
                        {row.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <TextField
              label="Employee No"
              value={createForm.employeeNo}
              onChange={(event) => setCreateForm((s) => ({ ...s, employeeNo: event.target.value }))}
            />
            <TextField
              label="Display Name"
              value={createForm.displayName}
              onChange={(event) => setCreateForm((s) => ({ ...s, displayName: event.target.value }))}
              required
            />
            <TextField
              label="Email"
              value={createForm.email}
              onChange={(event) => setCreateForm((s) => ({ ...s, email: event.target.value }))}
              required
            />
            <TextField
              label="Business Unit"
              value={createForm.businessUnit}
              onChange={(event) => setCreateForm((s) => ({ ...s, businessUnit: event.target.value }))}
            />
            <TextField
              label="Department"
              value={createForm.department}
              onChange={(event) => setCreateForm((s) => ({ ...s, department: event.target.value }))}
            />
            <TextField
              label="Team"
              value={createForm.team}
              onChange={(event) => setCreateForm((s) => ({ ...s, team: event.target.value }))}
            />
            <TextField
              label="Position"
              value={createForm.position}
              onChange={(event) => setCreateForm((s) => ({ ...s, position: event.target.value }))}
            />
            <TextField
              select
              label="Role"
              value={createForm.role}
              onChange={(event) => setCreateForm((s) => ({ ...s, role: event.target.value }))}
            >
              {roleList.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => void saveCreate()} disabled={busy}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

