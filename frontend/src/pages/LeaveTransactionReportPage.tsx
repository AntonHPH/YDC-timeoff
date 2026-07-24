import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
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
import { exportReport, getLeaveTransactionRows, LeaveTransactionRow } from "../services/api";

export function LeaveTransactionReportPage() {
  const [rows, setRows] = useState<LeaveTransactionRow[]>([]);
  const [filters, setFilters] = useState({
    employee: "",
    department: "All",
    leaveType: "All",
    dateFrom: "",
    dateTo: "",
    status: "All",
  });

  useEffect(() => {
    const load = async () => {
      const data = await getLeaveTransactionRows();
      setRows(data);
    };

    void load();
  }, []);

  const departments = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.department)))], [rows]);
  const leaveTypes = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.leaveType)))], [rows]);

  const filtered = useMemo(() => {
    return rows.filter((x) => {
      const start = x.startDate.slice(0, 10);
      const employeeOk = !filters.employee || x.employee.toLowerCase().includes(filters.employee.toLowerCase());
      const depOk = filters.department === "All" || x.department === filters.department;
      const leaveTypeOk = filters.leaveType === "All" || x.leaveType === filters.leaveType;
      const statusOk = filters.status === "All" || x.status === filters.status;
      const fromOk = !filters.dateFrom || start >= filters.dateFrom;
      const toOk = !filters.dateTo || start <= filters.dateTo;
      return employeeOk && depOk && leaveTypeOk && statusOk && fromOk && toOk;
    });
  }, [rows, filters]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Leave Transaction Report
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={1}>
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
                  select
                  size="small"
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
                >
                  {["All", "Pending", "Approved", "Rejected", "Cancelled"].map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} mt={1.5}>
              <Button variant="outlined" onClick={() => void exportReport("leave-transaction", "pdf")}>
                PDF
              </Button>
              <Button variant="outlined" onClick={() => void exportReport("leave-transaction", "excel")}>
                Excel
              </Button>
              <Button variant="outlined" onClick={() => void exportReport("leave-transaction", "csv")}>
                CSV
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.referenceNo} hover>
                    <TableCell>{row.referenceNo}</TableCell>
                    <TableCell>{row.employee}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.leaveType}</TableCell>
                    <TableCell>
                      {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{row.durationDays}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

