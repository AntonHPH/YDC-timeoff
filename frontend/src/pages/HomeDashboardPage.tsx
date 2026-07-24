import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { StatusChip } from "../components/StatusChip";
import { SummaryCard } from "../components/SummaryCard";
import { defaultEmployeeId } from "../constants";
import { getDashboardSummary, getWorklist } from "../services/api";
import { DashboardSummary, WorklistItem } from "../types";

export function HomeDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [summaryData, worklistData] = await Promise.all([
          getDashboardSummary(defaultEmployeeId),
          getWorklist(defaultEmployeeId),
        ]);

        setSummary(summaryData);
        setWorklist(worklistData);
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Home Dashboard
        </Typography>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <SummaryCard title="Annual Leave Balance" value={`${summary?.annualLeaveBalance ?? 0}`} tone="#0B3D91" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <SummaryCard title="Compensation Leave" value={`${summary?.compensationLeaveBalance ?? 0}`} tone="#1565C0" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <SummaryCard title="Sick Leave Balance" value={`${summary?.sickLeaveBalance ?? 0}`} tone="#6A1B9A" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <SummaryCard title="Pending Approvals" value={`${summary?.pendingApprovals ?? 0}`} tone="#ED6C02" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <SummaryCard
          title="Team Members on Leave Today"
          value={`${summary?.teamMembersOnLeaveToday ?? 0}`}
          tone="#2E7D32"
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Worklist
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {worklist.map((row) => (
                  <TableRow key={row.referenceNo} hover>
                    <TableCell>{row.referenceNo}</TableCell>
                    <TableCell>{row.applicant}</TableCell>
                    <TableCell>{row.leaveType}</TableCell>
                    <TableCell>
                      {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                    </TableCell>
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

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Team Snapshot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use Team Calendar and Department Calendar for leave coverage checks.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


