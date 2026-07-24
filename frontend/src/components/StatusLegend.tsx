import { Box, Stack, Typography } from "@mui/material";

interface LegendItem {
  label: string;
  color: string;
}

export function StatusLegend({ items }: { items: LegendItem[] }) {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {items.map((item) => (
        <Stack key={item.label} direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: item.color }} />
          <Typography variant="body2">{item.label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

