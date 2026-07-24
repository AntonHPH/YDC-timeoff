import { Alert, Box } from "@mui/material";

export function MicrosoftSignInPage() {
  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="info">Microsoft sign-in is disabled in demo mode.</Alert>
    </Box>
  );
}

