import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Alert,
  Box,
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
import { StatusLegend } from "../components/StatusLegend";
import { defaultEmployeeId } from "../constants";
import {
  calculateLeave,
  createLeaveApplication,
  getLeaveApplications,
  getLeaveTypes,
} from "../services/api";
import { LeaveApplication, LeaveCalculationResult, LeaveType } from "../types";

const eventColorByStatus: Record<string, string> = {
  Approved: "#2E7D32",
  Pending: "#ED6C02",
  Rejected: "#D32F2F",
  Cancelled: "#78909C",
};

export function ApplyLeavePage() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingError, setLoadingError] = useState("");

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [session, setSession] = useState<"FullDay" | "AM" | "PM">("FullDay");
  const [remarks, setRemarks] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  const [calculation, setCalculation] = useState<LeaveCalculationResult | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoadingError("");

    try {
      const [apps, types] = await Promise.all([getLeaveApplications(), getLeaveTypes()]);
      setApplications(apps);
      setLeaveTypes(types);
      setLeaveTypeId(types[0]?.id ?? "");
    } catch {
      setLoadingError("Unable to load leave data.");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const refreshCalculation = async () => {
      setCalculation(null);

      if (!leaveTypeId || !startDate || !endDate) {
        return;
      }

      try {
        const payload = {
          startDate,
          endDate,
          session,
          employeeId: defaultEmployeeId,
          leaveTypeId,
        };

        const calc = await calculateLeave(payload);
        setCalculation(calc);
      } catch {
        // Keep form usable even if calculation fails.
      }
    };

    void refreshCalculation();
  }, [leaveTypeId, startDate, endDate, session]);

  const calendarEvents = useMemo(
    () =>
      applications.map((app) => ({
        id: app.id,
        title: `${app.applicantName} - ${app.leaveTypeName}`,
        start: app.startDate,
        end: app.endDate,
        color: eventColorByStatus[app.status] ?? "#78909C",
      })),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      return applications;
    }

    return applications.filter((x) => {
      return (
        x.referenceNo.toLowerCase().includes(q) ||
        x.applicantName.toLowerCase().includes(q) ||
        x.leaveTypeName.toLowerCase().includes(q)
      );
    });
  }, [applications, searchTerm]);

  const submit = async () => {
    setSubmitMessage("");
    setSubmitError("");

    if (!leaveTypeId || !startDate || !endDate) {
      setSubmitError("Please complete leave type and dates.");
      return;
    }

    try {
      await createLeaveApplication({
        applicantId: defaultEmployeeId,
        leaveTypeId,
        startDate,
        endDate,
        session,
        remarks,
      });

      setSubmitMessage("Leave application submitted.");
      setRemarks("");
      setAttachmentName("");
      await loadData();
    } catch {
      setSubmitError("Unable to submit application. Check leave balance and date range.");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Apply Leave
        </Typography>
      </Grid>

      {loadingError && (
        <Grid item xs={12}>
          <Alert severity="error">{loadingError}</Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <StatusLegend
          items={[
            { label: "Approved Leave", color: "#2E7D32" },
            { label: "Pending Leave", color: "#ED6C02" },
            { label: "Rejected Leave", color: "#D32F2F" },
            { label: "Public Holiday", color: "#6A1B9A" },
            { label: "Team Leave", color: "#1565C0" },
          ]}
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={calendarEvents}
              height={620}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Leave Application Panel
            </Typography>

            <Stack spacing={1.5}>
              <TextField select label="Leave Type" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
                {leaveTypes.map((x) => (
                  <MenuItem key={x.id} value={x.id}>
                    {x.nameEn}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField select label="Session" value={session} onChange={(e) => setSession(e.target.value as "FullDay" | "AM" | "PM")}>
                <MenuItem value="FullDay">Full Day</MenuItem>
                <MenuItem value="AM">AM</MenuItem>
                <MenuItem value="PM">PM</MenuItem>
              </TextField>

              <TextField
                label="Remarks"
                multiline
                minRows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <Button variant="outlined" component="label">
                Upload Supporting Document
                <input
                  hidden
                  type="file"
                  onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? "")}
                />
              </Button>

              {attachmentName && <Typography variant="body2">Attachment: {attachmentName}</Typography>}

              {calculation && (
                <Alert severity={calculation.balanceSufficient ? "success" : "warning"}>
                  Total Working Days: {calculation.workingDays}. Remaining Balance: {calculation.remainingBalance}
                </Alert>
              )}

              {submitMessage && <Alert severity="success">{submitMessage}</Alert>}
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={submit}>
                  Submit
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSession("FullDay");
                    setRemarks("");
                    setCalculation(null);
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} mb={1} alignItems={{ md: "center" }}>
              <Typography variant="h6" fontWeight={700}>
                Reference Search
              </Typography>
              <Box sx={{ flex: 1 }} />
              <TextField
                size="small"
                sx={{ minWidth: 320 }}
                placeholder="Search by reference number, applicant name, leave type"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.referenceNo}</TableCell>
                    <TableCell>{row.applicantName}</TableCell>
                    <TableCell>{row.leaveTypeName}</TableCell>
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

