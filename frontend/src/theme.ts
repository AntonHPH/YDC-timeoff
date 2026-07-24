import { createTheme } from "@mui/material/styles";

const primary = "#0B3D91";
const secondary = "#F3F5F7";

export const statusColors = {
  approved: "#2E7D32",
  pending: "#ED6C02",
  rejected: "#D32F2F",
  holiday: "#6A1B9A",
  wfh: "#1565C0",
} as const;

export const buildTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: "#CFD8DC" },
      background:
        mode === "light"
          ? { default: "#FFFFFF", paper: secondary }
          : { default: "#0F172A", paper: "#1E293B" },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(15, 23, 42, 0.08)",
          },
        },
      },
    },
  });

