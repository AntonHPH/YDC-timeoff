import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export function AiAssistantWidget() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Smart assistant is currently unavailable. Use search or open documentation for guidance.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.location.assign("/my-preferences")}
          >
            Open My Preferences
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
