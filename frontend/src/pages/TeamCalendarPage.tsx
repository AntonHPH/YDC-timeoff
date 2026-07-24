import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { StatusLegend } from "../components/StatusLegend";
import { getTeamCalendar } from "../services/api";
import { CalendarEventItem } from "../types";

function colorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const value = Math.abs(hash % 16777215).toString(16).padStart(6, "0");
  return `#${value}`;
}

export function TeamCalendarPage() {
  const [rows, setRows] = useState<CalendarEventItem[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      const data = await getTeamCalendar();
      setRows(data);
    };

    void load();
  }, []);

  const employeeNames = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.employeeName)))], [rows]);
  const leaveTypes = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.leaveType)))], [rows]);

  const filtered = useMemo(() => {
    return rows.filter((x) => {
      const employeeOk = employeeFilter === "All" || x.employeeName === employeeFilter;
      const leaveTypeOk = leaveTypeFilter === "All" || x.leaveType === leaveTypeFilter;
      return employeeOk && leaveTypeOk;
    });
  }, [rows, employeeFilter, leaveTypeFilter]);

  const employeeStatus = useMemo(() => {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);

    return employeeNames
      .filter((x) => x !== "All")
      .map((name) => {
        const isOnLeave = rows.some((row) => {
          if (row.employeeName !== name) {
            return false;
          }
          const start = row.startDate.slice(0, 10);
          const end = row.endDate.slice(0, 10);
          return start <= date && end >= date && row.status === "Approved";
        });

        return {
          name,
          position: rows.find((x) => x.employeeName === name)?.department ?? "-",
          status: isOnLeave ? "On Leave" : "Available",
        };
      });
  }, [employeeNames, rows]);

  const events = filtered.map((row) => ({
    id: row.id,
    title: `${row.employeeName} - ${row.leaveType}`,
    start: row.startDate,
    end: row.endDate,
    color: colorFromName(row.employeeName),
    extendedProps: row,
  }));

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Team Calendar
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField select label="Employee" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            {employeeNames.map((x) => (
              <MenuItem key={x} value={x}>
                {x}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Leave Type" value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
            {leaveTypes.map((x) => (
              <MenuItem key={x} value={x}>
                {x}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Team Member List
            </Typography>
            <List dense>
              {employeeStatus.map((x) => (
                <ListItem key={x.name} divider>
                  <ListItemText primary={x.name} secondary={`${x.position} | ${x.status}`} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={9}>
        <Card>
          <CardContent>
            <StatusLegend
              items={employeeStatus.slice(0, 6).map((x) => ({
                label: x.name,
                color: colorFromName(x.name),
              }))}
            />
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              events={events}
              eventDidMount={(info) => {
                const e = info.event.extendedProps as CalendarEventItem;
                info.el.title = `${e.employeeName} | ${e.leaveType} | ${e.status} | ${e.startDate} - ${e.endDate}`;
              }}
              height={650}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

