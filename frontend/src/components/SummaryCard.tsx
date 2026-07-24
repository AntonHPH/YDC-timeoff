import { Card, CardContent, Typography } from "@mui/material";

interface Props {
  title: string;
  value: string;
  tone?: string;
}

export function SummaryCard({ title, value, tone }: Props) {
  return (
    <Card sx={{ height: "100%", borderLeft: tone ? `4px solid ${tone}` : undefined }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        <Typography mt={1} variant="h4" fontWeight={800}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

