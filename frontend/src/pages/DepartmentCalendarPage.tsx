import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
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

import { getDepartmentCalendar } from "../services/api";
import { CalendarEventItem } from "../types";

const statusColor: Record<string, string> = {
  Approved: "#2E7D32",
  Pending: "#ED6C02",
  Rejected: "#D32F2F",
  Cancelled: "#607D8B",
};

export function DepartmentCalendarPage() {
  const [rows, setRows] = useState<CalendarEventItem[]>([]);
  const [department, setDepartment] = useState("All");
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getDepartmentCalendar();
      setRows(data);
    };

    void load();
  }, []);

  const departments = useMemo(() => ["All", ...Array.from(new Set(rows.map((x) => x.department)))], [rows]);

  const filtered = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();

    return rows.filter((x) => {
      const depOk = department === "All" || x.department === department;
      const employeeOk = !q || x.employeeName.toLowerCase().includes(q);
      return depOk && employeeOk;
    });
  }, [rows, department, employeeSearch]);

  const events = filtered.map((x) => ({
    id: x.id,
    title: `${x.employeeName} - ${x.leaveType}`,
    start: x.startDate,
    end: x.endDate,
    color: statusColor[x.status] ?? "#607D8B",
    extendedProps: x,
  }));

  const heatmap = useMemo(() => {
    const map = new Map<string, number>();

    for (const row of filtered) {
      const key = row.startDate.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Department Calendar
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField select label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}>
            {departments.map((x) => (
              <MenuItem key={x} value={x}>
                {x}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Search Employee"
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
          />
        </Stack>
      </Grid>

      <Grid item xs={12} md={9}>
        <Card>
          <CardContent>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              events={events}
              eventDidMount={(info) => {
                const e = info.event.extendedProps as CalendarEventItem;
                info.el.title = `${e.employeeName}\n${e.department}\n${e.leaveType}\n${e.startDate} - ${e.endDate}\n${e.status}\n${e.remarks ?? ""}`;
              }}
              height={640}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              Optional Heatmap View
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Volume</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {heatmap.map((x) => (
                  <TableRow key={x.date}>
                    <TableCell>{x.date}</TableCell>
                    <TableCell align="right">{x.count}</TableCell>
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

