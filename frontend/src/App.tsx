import { useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./layout/AppShell";
import { buildTheme } from "./theme";
import { ApplicationMaintenancePage } from "./pages/ApplicationMaintenancePage";
import { ApplyLeavePage } from "./pages/ApplyLeavePage";
import { DepartmentCalendarPage } from "./pages/DepartmentCalendarPage";
import { HomeDashboardPage } from "./pages/HomeDashboardPage";
import { LeaveBalanceReportPage } from "./pages/LeaveBalanceReportPage";
import { LeaveTransactionReportPage } from "./pages/LeaveTransactionReportPage";
import { LeaveTypeMaintenancePage } from "./pages/LeaveTypeMaintenancePage";
import { MyPreferencesPage } from "./pages/MyPreferencesPage";
import { ReportingHierarchyPage } from "./pages/ReportingHierarchyPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { TeamCalendarPage } from "./pages/TeamCalendarPage";
import { AccessControlPage } from "./pages/settings/AccessControlPage";
import { OrganizationUnitPage } from "./pages/settings/OrganizationUnitPage";
import { SystemCalendarPage } from "./pages/settings/SystemCalendarPage";
import { UserMaintenancePage } from "./pages/settings/UserMaintenancePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AuthUser, getCurrentUser, hasAnyRole, isAdminRole, isApproverRole, logout } from "./services/auth";

export function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const canMaintainApplications = isApproverRole(currentUser);
  const canMaintainLeaveTypes = isAdminRole(currentUser);
  const canAccessSystemSettings = isAdminRole(currentUser);
  const canViewReportingHierarchy = hasAnyRole(currentUser, ["Supervisor", "Manager", "HR", "SystemAdministrator"]);

  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={setCurrentUser} />} />
          <Route path="/register" element={<RegisterPage onRegisterSuccess={setCurrentUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <AppShell
        mode={mode}
        onToggleTheme={() => setMode((m) => (m === "light" ? "dark" : "light"))}
        userEmail={currentUser.email}
        userRole={currentUser.role}
        onLogout={() => {
          logout();
          setCurrentUser(null);
        }}
      >
        <Routes>
          <Route path="/" element={<HomeDashboardPage />} />

          <Route path="/e-leave/apply" element={<ApplyLeavePage />} />
          <Route path="/e-leave/team-calendar" element={<TeamCalendarPage />} />
          <Route path="/e-leave/department-calendar" element={<DepartmentCalendarPage />} />
          <Route
            path="/e-leave/application-maintenance"
            element={canMaintainApplications ? <ApplicationMaintenancePage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/e-leave/leave-type"
            element={canMaintainLeaveTypes ? <LeaveTypeMaintenancePage /> : <Navigate to="/" replace />}
          />
          <Route path="/e-leave/leave-balance-report" element={<LeaveBalanceReportPage />} />
          <Route path="/e-leave/leave-transaction-report" element={<LeaveTransactionReportPage />} />
          <Route
            path="/e-leave/reporting-hierarchy"
            element={canViewReportingHierarchy ? <ReportingHierarchyPage /> : <Navigate to="/" replace />}
          />
          <Route path="/search" element={<SearchResultsPage />} />

          <Route
            path="/my-preferences"
            element={<MyPreferencesPage onThemePreferenceChange={(themeMode) => setMode(themeMode)} />}
          />

          <Route
            path="/system-settings/organization-unit"
            element={canAccessSystemSettings ? <OrganizationUnitPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/system-settings/user-maintenance"
            element={canAccessSystemSettings ? <UserMaintenancePage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/system-settings/access-control"
            element={canAccessSystemSettings ? <AccessControlPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/system-settings/system-calendar"
            element={canAccessSystemSettings ? <SystemCalendarPage /> : <Navigate to="/" replace />}
          />

          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </ThemeProvider>
  );
}
