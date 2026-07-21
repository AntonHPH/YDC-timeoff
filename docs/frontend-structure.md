# Frontend Component Structure

## Core layout

- `src/layout/AppShell.tsx`
  - Top app bar (breadcrumbs, smart search, notification, profile)
  - Responsive left side navigation
  - Theme toggle and content shell
- `src/layout/navConfig.ts`
  - Enterprise navigation tree and route title mapping

## Reusable components

- `src/components/SummaryCard.tsx`
- `src/components/StatusChip.tsx`
- `src/components/StatusLegend.tsx`

## Page modules

- Dashboard: `src/pages/HomeDashboardPage.tsx`
- Leave operations:
  - `src/pages/ApplyLeavePage.tsx`
  - `src/pages/TeamCalendarPage.tsx`
  - `src/pages/DepartmentCalendarPage.tsx`
  - `src/pages/ApplicationMaintenancePage.tsx`
  - `src/pages/LeaveTypeMaintenancePage.tsx`
- Reports:
  - `src/pages/LeaveBalanceReportPage.tsx`
  - `src/pages/LeaveTransactionReportPage.tsx`
- Organization:
  - `src/pages/ReportingHierarchyPage.tsx`
- User and settings:
  - `src/pages/MyPreferencesPage.tsx`
  - `src/pages/settings/OrganizationUnitPage.tsx`
  - `src/pages/settings/UserMaintenancePage.tsx`
  - `src/pages/settings/AccessControlPage.tsx`
  - `src/pages/settings/SystemCalendarPage.tsx`

## Services and contracts

- `src/services/api.ts` central API integration and export handlers
- `src/types.ts` typed UI contracts
- `src/theme.ts` corporate theme tokens and dark mode readiness

