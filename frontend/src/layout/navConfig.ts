export interface NavNode {
  label: string;
  path?: string;
  children?: NavNode[];
  divider?: boolean;
}

export const navConfig: NavNode[] = [
  { label: "Home", path: "/" },
  {
    label: "E-Leave",
    children: [
      { label: "Apply Leave", path: "/e-leave/apply" },
      { label: "Team Calendar", path: "/e-leave/team-calendar" },
      { label: "Department Calendar", path: "/e-leave/department-calendar" },
      { label: "Application Maintenance", path: "/e-leave/application-maintenance" },
      { label: "Leave Type", path: "/e-leave/leave-type" },
      { label: "separator", divider: true },
      { label: "Leave Balance Report", path: "/e-leave/leave-balance-report" },
      { label: "Leave Transaction Report", path: "/e-leave/leave-transaction-report" },
      { label: "Reporting Hierarchy", path: "/e-leave/reporting-hierarchy" },
    ],
  },
  { label: "My Preferences", path: "/my-preferences" },
  {
    label: "System Settings",
    children: [
      { label: "Organization Unit", path: "/system-settings/organization-unit" },
      { label: "User Maintenance", path: "/system-settings/user-maintenance" },
      { label: "Access Control", path: "/system-settings/access-control" },
      { label: "System Calendar", path: "/system-settings/system-calendar" },
    ],
  },
];

export const routeTitleMap: Record<string, string> = {
  "/": "Home",
  "/e-leave/apply": "Apply Leave",
  "/e-leave/team-calendar": "Team Calendar",
  "/e-leave/department-calendar": "Department Calendar",
  "/e-leave/application-maintenance": "Application Maintenance",
  "/e-leave/leave-type": "Leave Type Maintenance",
  "/e-leave/leave-balance-report": "Leave Balance Report",
  "/e-leave/leave-transaction-report": "Leave Transaction Report",
  "/e-leave/reporting-hierarchy": "Reporting Hierarchy",
  "/search": "Search Results",
  "/my-preferences": "My Preferences",
  "/system-settings/organization-unit": "Organization Unit",
  "/system-settings/user-maintenance": "User Maintenance",
  "/system-settings/access-control": "Access Control",
  "/system-settings/system-calendar": "System Calendar",
};

