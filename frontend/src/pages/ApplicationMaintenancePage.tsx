import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
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

import { StatusChip } from "../components/StatusChip";
import { defaultApproverId } from "../constants";
import {
  approveLeave,
  cancelLeaveApplication,
  getLeaveApplicationAudit,
  getLeaveApplicationById,
  getLeaveApplications,
  rejectLeave,
  updateLeaveApplication,
} from "../services/api";
import { LeaveApplication, LeaveApplicationAuditEntry } from "../types";

type SortColumn = "referenceNo" | "applicantName" | "leaveTypeName" | "startDate" | "status";

export function ApplicationMaintenancePage() {
  const [rows, setRows] = useState<LeaveApplication[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [viewRow, setViewRow] = useState<LeaveApplication | null>(null);
  const [editRow, setEditRow] = useState<LeaveApplication | null>(null);
  const [editForm, setEditForm] = useState({ startDate: "", endDate: "", remarks: "" });

  const [auditOpen, setAuditOpen] = useState(false);
  const [auditRows, setAuditRows] = useState<LeaveApplicationAuditEntry[]>([]);
  const [auditTitle, setAuditTitle] = useState("");

  const [filters, setFilters] = useState({
    referenceNo: "",
    applicant: "",
    department: "",
    team: "",
    leaveType: "",
    status: "All",
    dateFrom: "",
    dateTo: "",
    approver: "",
    createdDate: "",
    hrmsExportStatus: "All",
  });

  const [sortBy, setSortBy] = useState<SortColumn>("startDate");

  const load = async () => {
    try {
      const data = await getLeaveApplications();
      setRows(data);
    } catch {
      setError("Unable to load application maintenance data.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows
      .filter((x) => {
        const start = x.startDate.slice(0, 10);
        const dateFromOk = !filters.dateFrom || start >= filters.dateFrom;
        const dateToOk = !filters.dateTo || start <= filters.dateTo;

        return (
          (!filters.referenceNo || x.referenceNo.toLowerCase().includes(filters.referenceNo.toLowerCase())) &&
          (!filters.applicant || x.applicantName.toLowerCase().includes(filters.applicant.toLowerCase())) &&
          (!filters.leaveType || x.leaveTypeName.toLowerCase().includes(filters.leaveType.toLowerCase())) &&
          (filters.status === "All" || x.status === filters.status) &&
          dateFromOk &&
          dateToOk
        );
      })
      .sort((a, b) => {
        const av = String(a[sortBy]);
        const bv = String(b[sortBy]);
        return av.localeCompare(bv);
      });
  }, [filters, rows, sortBy]);

  const act = async (id: string, action: "approve" | "reject") => {
    setMessage("");
    setError("");

    try {
      if (action === "approve") {
        await approveLeave(id, defaultApproverId, "Approved in maintenance");
      } else {
        await rejectLeave(id, defaultApproverId, "Rejected in maintenance");
      }

      setMessage(`Application ${action}d.`);
      await load();
    } catch {
      setError(`Unable to ${action} application.`);
    }
  };

  const openView = async (row: LeaveApplication) => {
    setError("");
    const latest = await getLeaveApplicationById(row.id);
    setViewRow(latest ?? row);
  };

  const openEdit = async (row: LeaveApplication) => {
    setError("");
    if (row.status !== "Pending") {
      setError("Only pending applications can be edited.");
      return;
    }

    const latest = await getLeaveApplicationById(row.id);
    const target = latest ?? row;

    setEditRow(target);
    setEditForm({
      startDate: target.startDate.slice(0, 10),
      endDate: target.endDate.slice(0, 10),
      remarks: target.remarks ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editRow) {
      return;
    }

    setBusy(true);
    setMessage("");
    setError("");

    try {
      await updateLeaveApplication(editRow.id, {
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        remarks: editForm.remarks,
      });

      setMessage("Application updated.");
      setEditRow(null);
      await load();
    } catch {
      setError("Unable to update application.");
    } finally {
      setBusy(false);
    }
  };

  const cancelRow = async (row: LeaveApplication) => {
    if (row.status === "Cancelled") {
      return;
    }

    const confirmed = window.confirm(`Cancel application ${row.referenceNo}?`);
    if (!confirmed) {
      return;
    }

    setBusy(true);
    setMessage("");
    setError("");

    try {
      await cancelLeaveApplication(row.id, defaultApproverId, "Cancelled in maintenance");
      setMessage("Application cancelled.");
      await load();
    } catch {
      setError("Unable to cancel application.");
    } finally {
      setBusy(false);
    }
  };

  const openAudit = async (row: LeaveApplication) => {
    setError("");
    setAuditTitle(row.referenceNo);
    setAuditOpen(true);

    try {
      const data = await getLeaveApplicationAudit(row.id);
      setAuditRows(data);
    } catch {
      setAuditRows([]);
      setError("Unable to load audit trail.");
    }
  };

  const exportCsv = () => {
    const header = ["Reference", "Applicant", "Leave Type", "Start Date", "End Date", "Duration", "Status", "Remarks"];
    const lines = filteredRows.map((x) =>
      [
        x.referenceNo,
        x.applicantName,
        x.leaveTypeName,
        x.startDate.slice(0, 10),
        x.endDate.slice(0, 10),
        x.durationDays,
        x.status,
        (x.remarks ?? "").replace(/\r?\n/g, " "),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = `${header.join(",")}\n${lines.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-maintenance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Application Maintenance
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Enterprise Search
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Reference Number"
                  value={filters.referenceNo}
                  onChange={(e) => setFilters((s) => ({ ...s, referenceNo: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Applicant"
                  value={filters.applicant}
                  onChange={(e) => setFilters((s) => ({ ...s, applicant: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Department"
                  value={filters.department}
                  onChange={(e) => setFilters((s) => ({ ...s, department: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Team"
                  value={filters.team}
                  onChange={(e) => setFilters((s) => ({ ...s, team: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Leave Type"
                  value={filters.leaveType}
                  onChange={(e) => setFilters((s) => ({ ...s, leaveType: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
                >
                  {[
                    "All",
                    "Pending",
                    "Approved",
                    "Rejected",
                    "Cancelled",
                  ].map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Date From"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((s) => ({ ...s, dateFrom: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Date To"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((s) => ({ ...s, dateTo: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Approver"
                  value={filters.approver}
                  onChange={(e) => setFilters((s) => ({ ...s, approver: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Created Date"
                  value={filters.createdDate}
                  onChange={(e) => setFilters((s) => ({ ...s, createdDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="HRMS Export Status"
                  value={filters.hrmsExportStatus}
                  onChange={(e) => setFilters((s) => ({ ...s, hrmsExportStatus: e.target.value }))}
                >
                  {[
                    "All",
                    "Pending",
                    "Exported",
                    "Failed",
                  ].map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} mb={1}>
              <Typography variant="h6" fontWeight={700}>
                Results Table
              </Typography>
              <TextField
                select
                size="small"
                label="Sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortColumn)}
              >
                <MenuItem value="referenceNo">Reference</MenuItem>
                <MenuItem value="applicantName">Applicant</MenuItem>
                <MenuItem value="leaveTypeName">Leave Type</MenuItem>
                <MenuItem value="startDate">Start Date</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </TextField>
              <BoxGrow />
              <Button variant="outlined" onClick={exportCsv}>
                Export
              </Button>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.referenceNo}</TableCell>
                    <TableCell>{row.applicantName}</TableCell>
                    <TableCell>{row.leaveTypeName}</TableCell>
                    <TableCell>
                      {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Button size="small" variant="text" onClick={() => void openView(row)}>
                          View
                        </Button>
                        <Button size="small" variant="text" onClick={() => void openEdit(row)} disabled={row.status !== "Pending" || busy}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="warning"
                          onClick={() => void cancelRow(row)}
                          disabled={row.status === "Cancelled" || busy}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => void act(row.id, "approve")}
                          disabled={row.status !== "Pending"}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => void act(row.id, "reject")}
                          disabled={row.status !== "Pending"}
                        >
                          Reject
                        </Button>
                        <Button size="small" variant="text" onClick={() => void openAudit(row)}>
                          Audit
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={Boolean(viewRow)} onClose={() => setViewRow(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent dividers>
          {viewRow && (
            <Stack spacing={1.25}>
              <Typography variant="body2"><b>Reference:</b> {viewRow.referenceNo}</Typography>
              <Typography variant="body2"><b>Applicant:</b> {viewRow.applicantName}</Typography>
              <Typography variant="body2"><b>Leave Type:</b> {viewRow.leaveTypeName}</Typography>
              <Typography variant="body2"><b>Date:</b> {viewRow.startDate.slice(0, 10)} to {viewRow.endDate.slice(0, 10)}</Typography>
              <Typography variant="body2"><b>Session:</b> {viewRow.session}</Typography>
              <Typography variant="body2"><b>Duration:</b> {viewRow.durationDays} days</Typography>
              <Typography variant="body2"><b>Status:</b> {viewRow.status}</Typography>
              <Typography variant="body2"><b>Remarks:</b> {viewRow.remarks || "-"}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewRow(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editRow)} onClose={() => setEditRow(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Application</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editForm.startDate}
              onChange={(e) => setEditForm((s) => ({ ...s, startDate: e.target.value }))}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editForm.endDate}
              onChange={(e) => setEditForm((s) => ({ ...s, endDate: e.target.value }))}
            />
            <TextField
              label="Remarks"
              multiline
              minRows={3}
              value={editForm.remarks}
              onChange={(e) => setEditForm((s) => ({ ...s, remarks: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRow(null)}>Close</Button>
          <Button variant="contained" onClick={() => void saveEdit()} disabled={busy || !editForm.startDate || !editForm.endDate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={auditOpen} onClose={() => setAuditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Audit Trail - {auditTitle}</DialogTitle>
        <DialogContent dividers>
          {auditRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No audit records found.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Comment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditRows.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.actorName}</TableCell>
                    <TableCell>{entry.comment || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

function BoxGrow() {
  return <Stack sx={{ flex: 1 }} />;
}

