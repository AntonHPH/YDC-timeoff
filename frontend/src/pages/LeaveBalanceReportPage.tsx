import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
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

import { exportReport, getLeaveBalanceRows, LeaveBalanceRow } from "../services/api";

export function LeaveBalanceReportPage() {
  const [rows, setRows] = useState<LeaveBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    businessUnit: "All",
    department: "All",
    team: "All",
    employee: "",
    leaveType: "All",
    date: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getLeaveBalanceRows();
      setRows(data);
      setLoading(false);
    };

    void load();
  }, []);

  const businessUnits = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.businessUnit)))], [rows]);
  const departments = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.department)))], [rows]);
  const teams = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.team)))], [rows]);
  const leaveTypes = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.leaveType)))], [rows]);

  const filtered = useMemo(() => {
    const q = filters.employee.trim().toLowerCase();

    return rows.filter((x) => {
      return (
        (filters.businessUnit === "All" || x.businessUnit === filters.businessUnit) &&
        (filters.department === "All" || x.department === filters.department) &&
        (filters.team === "All" || x.team === filters.team) &&
        (filters.leaveType === "All" || x.leaveType === filters.leaveType) &&
        (!q || x.employee.toLowerCase().includes(q))
      );
    });
  }, [rows, filters]);

  const departmentUsage = useMemo(() => {
    const map = new Map<string, number>();

    for (const row of filtered) {
      map.set(row.department, (map.get(row.department) ?? 0) + row.balanceDays);
    }

    return Array.from(map.entries())
      .map(([department, value]) => ({ department, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const maxValue = Math.max(...departmentUsage.map((x) => x.value), 1);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Leave Balance Report
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Business Unit"
                  value={filters.businessUnit}
                  onChange={(e) => setFilters((s) => ({ ...s, businessUnit: e.target.value }))}
                >
                  {businessUnits.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Department"
                  value={filters.department}
                  onChange={(e) => setFilters((s) => ({ ...s, department: e.target.value }))}
                >
                  {departments.map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Team"
                  value={filters.team}
                  onChange={(e) => setFilters((s) => ({ ...s, team: e.target.value }))}
                >
                  {teams.map((x) => (
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
                  label="Employee"
                  value={filters.employee}
                  onChange={(e) => setFilters((s) => ({ ...s, employee: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Leave Type"
                  value={filters.leaveType}
                  onChange={(e) => setFilters((s) => ({ ...s, leaveType: e.target.value }))}
                >
                  {leaveTypes.map((x) => (
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
                  label="Date"
                  value={filters.date}
                  onChange={(e) => setFilters((s) => ({ ...s, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} mt={1.5}>
              <Button variant="outlined" onClick={() => void exportReport("leave-balance", "pdf")}>
                PDF
              </Button>
              <Button variant="outlined" onClick={() => void exportReport("leave-balance", "excel")}>
                Excel
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {loading && (
        <Grid item xs={12}>
          <LinearProgress />
        </Grid>
      )}

      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Leave Balance Data
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Business Unit</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row, i) => (
                  <TableRow key={`${row.employee}-${row.leaveType}-${i}`}>
                    <TableCell>{row.businessUnit}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.team}</TableCell>
                    <TableCell>{row.employee}</TableCell>
                    <TableCell>{row.leaveType}</TableCell>
                    <TableCell align="right">{row.balanceDays}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Dashboard Charts (Balance Distribution / Utilization / Department Comparison)
            </Typography>

            {departmentUsage.map((item) => (
              <Stack key={item.department} spacing={0.5} mb={1}>
                <Typography variant="body2">{item.department}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.round((item.value / maxValue) * 100)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {item.value.toFixed(2)} total remaining days
                </Typography>
              </Stack>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

