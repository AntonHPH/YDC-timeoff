import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { getPreferenceDefaults, Preference, savePreferences } from "../services/api";

interface Props {
  onThemePreferenceChange: (theme: "light" | "dark") => void;
}

export function MyPreferencesPage({ onThemePreferenceChange }: Props) {
  const [preference, setPreference] = useState<Preference | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const defaults = await getPreferenceDefaults();
      setPreference(defaults);
    };

    void load();
  }, []);

  const update = <K extends keyof Preference>(key: K, value: Preference[K]) => {
    setPreference((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const save = async () => {
    if (!preference) {
      return;
    }

    await savePreferences(preference);
    onThemePreferenceChange(preference.theme === "dark" ? "dark" : "light");
    setMessage("Preferences saved successfully.");
  };

  if (!preference) {
    return <Typography>Loading preferences...</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          My Preferences
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              {message && <Alert severity="success">{message}</Alert>}

              <TextField
                select
                label="Language"
                value={preference.language}
                onChange={(e) => update("language", e.target.value)}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Traditional Chinese">Traditional Chinese</MenuItem>
                <MenuItem value="Simplified Chinese">Simplified Chinese</MenuItem>
              </TextField>

              <TextField
                select
                label="Theme"
                value={preference.theme}
                onChange={(e) => update("theme", e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </TextField>

              <TextField
                select
                label="Default Calendar View"
                value={preference.defaultCalendarView}
                onChange={(e) => update("defaultCalendarView", e.target.value)}
              >
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="day">Day</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={preference.notificationEnabled}
                    onChange={(e) => update("notificationEnabled", e.target.checked)}
                  />
                }
                label="Notification Settings"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preference.dashboardPersonalizationEnabled}
                    onChange={(e) => update("dashboardPersonalizationEnabled", e.target.checked)}
                  />
                }
                label="Dashboard Personalization"
              />

              <Button variant="contained" onClick={() => void save()}>
                Save Preferences
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

