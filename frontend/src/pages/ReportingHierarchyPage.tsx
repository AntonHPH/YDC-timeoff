import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { getHierarchyTable, getHierarchyTree, validateHierarchy } from "../services/api";
import { HierarchyNode } from "../types";

type ViewMode = "tree" | "org" | "table";

interface HierarchyRow {
  managerName: string;
  employeeName: string;
  sequence: number;
}

export function ReportingHierarchyPage() {
  const [tree, setTree] = useState<HierarchyNode[]>([]);
  const [tableRows, setTableRows] = useState<HierarchyRow[]>([]);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [view, setView] = useState<ViewMode>("tree");
  const [dragMode, setDragMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [treeData, tableData, validation] = await Promise.all([
        getHierarchyTree(),
        getHierarchyTable(),
        validateHierarchy(),
      ]);

      setTree(treeData);
      setTableRows(tableData);
      setValidationMessages(validation.messages);
    };

    void load();
  }, []);

  const moveRow = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= tableRows.length) {
      return;
    }

    setTableRows((prev) => {
      const copy = [...prev];
      const [current] = copy.splice(index, 1);
      copy.splice(target, 0, current);
      return copy;
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Reporting Hierarchy
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={(_, value: ViewMode | null) => value && setView(value)}
          >
            <ToggleButton value="tree">Tree View</ToggleButton>
            <ToggleButton value="org">Organization Chart</ToggleButton>
            <ToggleButton value="table">Table View</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            color={dragMode ? "success" : "primary"}
            onClick={() => setDragMode((x) => !x)}
          >
            {dragMode ? "Disable Drag and Drop Mode" : "Enable Drag and Drop Mode"}
          </Button>
        </Stack>
      </Grid>

      {dragMode && (
        <Grid item xs={12}>
          <Alert severity="info">Drag mode is on. Use Up/Down in Table View to reorder reporting rows.</Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        {validationMessages.map((msg) => (
          <Alert key={msg} severity={msg.includes("passed") ? "success" : "warning"} sx={{ mb: 1 }}>
            {msg}
          </Alert>
        ))}
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            {view === "tree" && <HierarchyTree nodes={tree} />}
            {view === "org" && <HierarchyOrgChart nodes={tree} />}
            {view === "table" && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Manager</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Sequence</TableCell>
                    <TableCell>Order</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row, index) => (
                    <TableRow key={`${row.managerName}-${row.employeeName}-${index}`}>
                      <TableCell>{row.managerName}</TableCell>
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>{row.sequence}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Button size="small" onClick={() => moveRow(index, -1)}>
                            Up
                          </Button>
                          <Button size="small" onClick={() => moveRow(index, 1)}>
                            Down
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              Hierarchy Validation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Checks for missing approvers, circular reporting, and approval bottlenecks.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function HierarchyTree({ nodes }: { nodes: HierarchyNode[] }) {
  return (
    <Stack spacing={1}>
      {nodes.map((node) => (
        <Card key={node.employeeId} variant="outlined">
          <CardContent>
            <Typography fontWeight={700}>{node.employeeName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {node.position}
            </Typography>
            {node.reports.length > 0 && (
              <Stack mt={1} ml={2} spacing={1}>
                <HierarchyTree nodes={node.reports} />
              </Stack>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

function HierarchyOrgChart({ nodes }: { nodes: HierarchyNode[] }) {
  return (
    <Stack spacing={1.5}>
      {nodes.map((node) => (
        <Card key={node.employeeId}>
          <CardContent>
            <Typography fontWeight={800}>{node.employeeName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {node.position}
            </Typography>
            <Typography variant="caption">Direct reports: {node.reports.length}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

