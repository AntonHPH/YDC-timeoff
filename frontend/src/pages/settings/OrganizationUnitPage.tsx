import { useEffect, useState } from "react";
import { Card, CardContent, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import { getOrganizationUnits, OrganizationUnitRow } from "../../services/api";

export function OrganizationUnitPage() {
  const [rows, setRows] = useState<OrganizationUnitRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getOrganizationUnits();
      setRows(data);
    };

    void load();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Organization Unit
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Team</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={`${row.businessUnit}-${row.department}-${idx}`}>
                    <TableCell>Hutchison Ports</TableCell>
                    <TableCell>{row.businessUnit}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.team}</TableCell>
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

