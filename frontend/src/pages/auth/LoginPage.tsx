import { FormEvent, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { AuthUser, login } from "../../services/auth";

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
}

export function LoginPage({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("admin@hutchisonports.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const result = login(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    onLoginSuccess(result.user);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={800}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Hutchison Ports E-Leave
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack component="form" spacing={1.5} onSubmit={submit}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained">
              Login
            </Button>
          </Stack>

          <Typography mt={2} variant="body2">
            No account? <Link component={RouterLink} to="/register">Register</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
