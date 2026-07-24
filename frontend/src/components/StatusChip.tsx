import { Chip } from "@mui/material";

import { statusColorMap } from "../constants";

export function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      size="small"
      label={status}
      sx={{
        backgroundColor: statusColorMap[status] ?? "#607D8B",
        color: "#fff",
        fontWeight: 700,
      }}
    />
  );
}

