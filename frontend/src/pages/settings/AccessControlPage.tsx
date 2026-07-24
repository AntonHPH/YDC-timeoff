import { useEffect, useState } from "react";
import { Card, CardContent, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import { AccessControlRow, getAccessControl } from "../../services/api";

export function AccessControlPage() {
  const [rows, setRows] = useState<AccessControlRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getAccessControl();
      setRows(data);
    };

    void load();
  }, []);

  const mark = (value: boolean) => (value ? "Y" : "N");

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Access Control (RBAC)
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Submit Leave</TableCell>
                  <TableCell align="center">Approve Leave</TableCell>
                  <TableCell align="center">HR Verification</TableCell>
                  <TableCell align="center">Administration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.role}>
                    <TableCell>{row.role}</TableCell>
                    <TableCell align="center">{mark(row.submitLeave)}</TableCell>
                    <TableCell align="center">{mark(row.approveLeave)}</TableCell>
                    <TableCell align="center">{mark(row.hrVerification)}</TableCell>
                    <TableCell align="center">{mark(row.administration)}</TableCell>
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

