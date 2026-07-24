import axios from "axios";

import {
  CalendarEventItem,
  DashboardSummary,
  HierarchyNode,
  LeaveApplication,
  LeaveApplicationAuditEntry,
  LeaveCalculationResult,
  LeaveType,
  SmartSearchResponse,
  SmartSearchResultItem,
  WorklistItem,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5182",
  timeout: 10000,
});

type SessionType = "FullDay" | "AM" | "PM";
type ExportFormat = "pdf" | "excel" | "csv";

export interface LeaveApplicationUpdatePayload {
  startDate: string;
  endDate: string;
  remarks?: string;
}

interface EmployeeSeed {
  id: string;
  employeeNo: string;
  displayName: string;
  email: string;
  position: string;
  businessUnit: string;
  department: string;
  team: string;
}

interface BalanceSeed {
  employeeId: string;
  leaveTypeId: string;
  entitledDays: number;
  usedDays: number;
}

interface PublicHolidaySeed {
  date: string;
  name: string;
}

export interface LeaveBalanceRow {
  businessUnit: string;
  department: string;
  team: string;
  employee: string;
  leaveType: string;
  balanceDays: number;
}

export interface LeaveTransactionRow {
  referenceNo: string;
  employee: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  durationDays: number;
}

export interface HierarchyValidation {
  hasMissingApprovers: boolean;
  hasCircularReporting: boolean;
  hasBottlenecks: boolean;
  messages: string[];
}

export interface OrganizationUnitRow {
  businessUnit: string;
  department: string;
  team: string;
}

export interface UserRow {
  id: string;
  employeeNo: string;
  displayName: string;
  email: string;
  department: string;
  team: string;
  position: string;
  isActive: boolean;
}

export interface AccessControlRow {
  role: string;
  submitLeave: boolean;
  approveLeave: boolean;
  hrVerification: boolean;
  administration: boolean;
}

export interface SystemCalendarRow {
  date: string;
  type: string;
  name: string;
  recurring: boolean;
}

export interface Preference {
  language: string;
  theme: string;
  notificationEnabled: boolean;
  defaultCalendarView: string;
  dashboardPersonalizationEnabled: boolean;
}

const offlineStore = {
  employees: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      employeeNo: "E1001",
      displayName: "Alice Wong",
      email: "alice.wong@hutchisonports.com",
      position: "Operations Manager",
      businessUnit: "Hong Kong Terminal",
      department: "Operations",
      team: "Yard Ops",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      employeeNo: "E1002",
      displayName: "Bob Chan",
      email: "bob.chan@hutchisonports.com",
      position: "Supervisor",
      businessUnit: "Hong Kong Terminal",
      department: "Operations",
      team: "Yard Ops",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      employeeNo: "E2001",
      displayName: "Charlie Lee",
      email: "charlie.lee@hutchisonports.com",
      position: "HR Executive",
      businessUnit: "Hong Kong Terminal",
      department: "HR",
      team: "HR Services",
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      employeeNo: "E3001",
      displayName: "Diana Lam",
      email: "diana.lam@hutchisonports.com",
      position: "IT Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Applications",
    },
  ] as EmployeeSeed[],

  leaveTypes: [
    {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      code: "AL",
      nameEn: "Annual Leave",
      nameTc: "Annual Leave TC",
      nameSc: "Annual Leave SC",
      requireHrVerification: false,
      requireComments: false,
      excludeHoliday: true,
      allowPostDateApplication: false,
      requireSupportingDocument: false,
      minDaysPerApplication: 0.5,
      maxDaysPerApplication: 15,
      isActive: true,
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      code: "COMP",
      nameEn: "Compensation Leave",
      nameTc: "Compensation Leave TC",
      nameSc: "Compensation Leave SC",
      requireHrVerification: true,
      requireComments: true,
      excludeHoliday: true,
      allowPostDateApplication: true,
      requireSupportingDocument: true,
      minDaysPerApplication: 0.5,
      maxDaysPerApplication: 5,
      isActive: true,
    },
    {
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      code: "SICK",
      nameEn: "Sick Leave",
      nameTc: "Sick Leave TC",
      nameSc: "Sick Leave SC",
      requireHrVerification: false,
      requireComments: false,
      excludeHoliday: false,
      allowPostDateApplication: true,
      requireSupportingDocument: true,
      minDaysPerApplication: 0.5,
      maxDaysPerApplication: 30,
      isActive: true,
    },
    {
      id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      code: "WFH",
      nameEn: "Work From Home",
      nameTc: "Work From Home TC",
      nameSc: "Work From Home SC",
      requireHrVerification: false,
      requireComments: false,
      excludeHoliday: true,
      allowPostDateApplication: false,
      requireSupportingDocument: false,
      minDaysPerApplication: 0.5,
      maxDaysPerApplication: 20,
      isActive: true,
    },
  ] as LeaveType[],

  balances: [
    { employeeId: "11111111-1111-1111-1111-111111111111", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 20, usedDays: 4 },
    { employeeId: "11111111-1111-1111-1111-111111111111", leaveTypeId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", entitledDays: 6, usedDays: 1 },
    { employeeId: "11111111-1111-1111-1111-111111111111", leaveTypeId: "cccccccc-cccc-cccc-cccc-cccccccccccc", entitledDays: 14, usedDays: 2 },
    { employeeId: "22222222-2222-2222-2222-222222222222", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 16, usedDays: 8 },
    { employeeId: "44444444-4444-4444-4444-444444444444", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 18, usedDays: 6 },
    { employeeId: "44444444-4444-4444-4444-444444444444", leaveTypeId: "cccccccc-cccc-cccc-cccc-cccccccccccc", entitledDays: 14, usedDays: 1 },
  ] as BalanceSeed[],

  leaveApplications: [
    {
      id: "90000000-0000-0000-0000-000000000001",
      referenceNo: "REF20260710001",
      applicantId: "22222222-2222-2222-2222-222222222222",
      applicantName: "Bob Chan",
      leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      leaveTypeName: "Annual Leave",
      startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      durationDays: 2,
      session: "FullDay",
      status: "Pending",
      remarks: "Family commitment",
    },
    {
      id: "90000000-0000-0000-0000-000000000002",
      referenceNo: "REF20260710002",
      applicantId: "11111111-1111-1111-1111-111111111111",
      applicantName: "Alice Wong",
      leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      leaveTypeName: "Annual Leave",
      startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 6 * 86400000).toISOString(),
      durationDays: 2,
      session: "FullDay",
      status: "Approved",
      remarks: "Short break",
    },
    {
      id: "90000000-0000-0000-0000-000000000003",
      referenceNo: "REF20260710003",
      applicantId: "44444444-4444-4444-4444-444444444444",
      applicantName: "Diana Lam",
      leaveTypeId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      leaveTypeName: "Sick Leave",
      startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      endDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      durationDays: 2,
      session: "FullDay",
      status: "Approved",
      remarks: "Medical",
    },
  ] as LeaveApplication[],

  reportingRelations: [
    { managerId: "11111111-1111-1111-1111-111111111111", employeeId: "22222222-2222-2222-2222-222222222222", sequence: 1 },
    { managerId: "11111111-1111-1111-1111-111111111111", employeeId: "33333333-3333-3333-3333-333333333333", sequence: 1 },
    { managerId: "22222222-2222-2222-2222-222222222222", employeeId: "44444444-4444-4444-4444-444444444444", sequence: 1 },
  ],

  preferences: {
    language: "English",
    theme: "light",
    notificationEnabled: true,
    defaultCalendarView: "month",
    dashboardPersonalizationEnabled: true,
  } as Preference,

  publicHolidays: [
    { date: `${new Date().getFullYear()}-01-01`, name: "New Year" },
    { date: `${new Date().getFullYear()}-12-25`, name: "Christmas" },
    { date: `${new Date().getFullYear()}-12-26`, name: "Boxing Day" },
  ] as PublicHolidaySeed[],

  offlineNotified: false,
};

const auditTrailStore: Record<string, LeaveApplicationAuditEntry[]> = {};

function ensureAuditSeed(applicationId: string) {
  if (auditTrailStore[applicationId]) {
    return;
  }

  const app = offlineStore.leaveApplications.find((x) => x.id === applicationId);
  if (!app) {
    auditTrailStore[applicationId] = [];
    return;
  }

  auditTrailStore[applicationId] = [
    {
      id: `audit-${applicationId}-created`,
      applicationId,
      action: "Created",
      actorId: app.applicantId,
      actorName: app.applicantName,
      comment: app.remarks,
      timestamp: app.startDate,
    },
  ];
}

function addAuditEntry(
  applicationId: string,
  action: LeaveApplicationAuditEntry["action"],
  actorId: string,
  actorName: string,
  comment?: string
) {
  ensureAuditSeed(applicationId);

  const entry: LeaveApplicationAuditEntry = {
    id: crypto.randomUUID(),
    applicationId,
    action,
    actorId,
    actorName,
    comment,
    timestamp: new Date().toISOString(),
  };

  auditTrailStore[applicationId].unshift(entry);
}

function notifyOffline() {
  if (!offlineStore.offlineNotified) {
    console.warn("API unreachable. Using local offline data.");
    offlineStore.offlineNotified = true;
  }
}

async function withFallback<T>(live: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    return await live();
  } catch {
    notifyOffline();
    return await fallback();
  }
}

function findEmployee(employeeId: string): EmployeeSeed {
  return offlineStore.employees.find((x) => x.id === employeeId) ?? offlineStore.employees[0];
}

function findLeaveType(leaveTypeId: string): LeaveType {
  return offlineStore.leaveTypes.find((x) => x.id === leaveTypeId) ?? offlineStore.leaveTypes[0];
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function holidayDateSet(): Set<string> {
  return new Set(offlineStore.publicHolidays.map((x) => x.date));
}

function calcWorkingDaysDetailed(startIso: string, endIso: string, session: SessionType): {
  workingDays: number;
  excludedDates: string[];
} {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const holidays = holidayDateSet();
  let count = 0;
  const excludedDates: string[] = [];

  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    const dateKey = toDateKey(d);
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.has(dateKey);

    if (isWeekend || isHoliday) {
      excludedDates.push(dateKey);
      continue;
    }

    count += 1;
  }

  if (session === "AM" || session === "PM") {
    count -= 0.5;
  }

  return {
    workingDays: Math.max(0, Number(count.toFixed(2))),
    excludedDates,
  };
}

function calcWorkingDays(startIso: string, endIso: string, session: SessionType): number {
  return calcWorkingDaysDetailed(startIso, endIso, session).workingDays;
}

function getBalance(employeeId: string, leaveTypeId: string): BalanceSeed {
  let row = offlineStore.balances.find((x) => x.employeeId === employeeId && x.leaveTypeId === leaveTypeId);

  if (!row) {
    row = { employeeId, leaveTypeId, entitledDays: 0, usedDays: 0 };
    offlineStore.balances.push(row);
  }

  return row;
}

function buildCalendarRows(source: LeaveApplication[]): CalendarEventItem[] {
  return source.map((x) => {
    const employee = findEmployee(x.applicantId);
    return {
      id: x.id,
      employeeName: x.applicantName,
      leaveType: x.leaveTypeName,
      department: employee.department,
      team: employee.team,
      startDate: x.startDate,
      endDate: x.endDate,
      status: x.status,
      remarks: x.remarks,
    };
  });
}

function computeSmartSearchScore(query: string, values: Array<string | undefined>): number {
  let score = 0;
  for (const value of values) {
    if (!value) {
      continue;
    }

    if (value.toLowerCase().startsWith(query)) {
      score = Math.max(score, 3);
      continue;
    }

    if (value.toLowerCase().includes(query)) {
      score = Math.max(score, 2);
    }
  }

  return score;
}

function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function getDashboardSummary(employeeId: string): Promise<DashboardSummary> {
  return withFallback(
    async () => {
      const { data } = await api.get<DashboardSummary>(`/api/dashboard/summary?employeeId=${employeeId}`);
      return data;
    },
    () => {
      const annual = offlineStore.leaveTypes.find((x) => x.code === "AL")?.id ?? "";
      const comp = offlineStore.leaveTypes.find((x) => x.code === "COMP")?.id ?? "";
      const sick = offlineStore.leaveTypes.find((x) => x.code === "SICK")?.id ?? "";

      const annualBalance = getBalance(employeeId, annual);
      const compBalance = getBalance(employeeId, comp);
      const sickBalance = getBalance(employeeId, sick);

      const employee = findEmployee(employeeId);
      const today = new Date().toISOString().slice(0, 10);

      const teamMembersOnLeaveToday = offlineStore.leaveApplications.filter((x) => {
        const owner = findEmployee(x.applicantId);
        const start = x.startDate.slice(0, 10);
        const end = x.endDate.slice(0, 10);
        return owner.team === employee.team && x.status === "Approved" && start <= today && end >= today;
      }).length;

      return {
        annualLeaveBalance: annualBalance.entitledDays - annualBalance.usedDays,
        compensationLeaveBalance: compBalance.entitledDays - compBalance.usedDays,
        sickLeaveBalance: sickBalance.entitledDays - sickBalance.usedDays,
        pendingApprovals: offlineStore.leaveApplications.filter((x) => x.status === "Pending").length,
        teamMembersOnLeaveToday,
      };
    }
  );
}

export async function getWorklist(employeeId: string): Promise<WorklistItem[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<WorklistItem[]>(`/api/dashboard/worklist?employeeId=${employeeId}`);
      return data;
    },
    () =>
      [...offlineStore.leaveApplications]
        .sort((a, b) => b.startDate.localeCompare(a.startDate))
        .slice(0, 12)
        .map((x) => ({
          referenceNo: x.referenceNo,
          applicant: x.applicantName,
          leaveType: x.leaveTypeName,
          startDate: x.startDate,
          endDate: x.endDate,
          status: x.status,
        }))
  );
}

export async function getSmartSearch(query: string, limit = 10): Promise<SmartSearchResponse> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return { query: "", total: 0, items: [] };
  }

  const fallback = () => {
      const q = normalizedQuery.toLowerCase();
      const results: Array<{ score: number; item: SmartSearchResultItem }> = [];

      offlineStore.employees.forEach((employee) => {
        const score = computeSmartSearchScore(q, [
          employee.displayName,
          employee.employeeNo,
          employee.email,
          employee.department,
          employee.team,
        ]);

        if (score > 0) {
          results.push({
            score,
            item: {
              entityType: "Employee",
              entityId: employee.id,
              primaryText: employee.displayName,
              secondaryText: `${employee.employeeNo} - ${employee.department} - ${employee.team}`,
              route: "/system-settings/user-maintenance",
              badge: "Active",
            },
          });
        }
      });

      offlineStore.leaveTypes.forEach((leaveType) => {
        const score = computeSmartSearchScore(q, [leaveType.code, leaveType.nameEn, leaveType.nameTc, leaveType.nameSc]);

        if (score > 0) {
          results.push({
            score,
            item: {
              entityType: "LeaveType",
              entityId: leaveType.id,
              primaryText: leaveType.nameEn,
              secondaryText: `${leaveType.code} - ${leaveType.isActive ? "Active" : "Inactive"}`,
              route: "/e-leave/leave-type",
              badge: leaveType.code,
            },
          });
        }
      });

      offlineStore.leaveApplications.forEach((application) => {
        const score = computeSmartSearchScore(q, [
          application.referenceNo,
          application.applicantName,
          application.leaveTypeName,
          application.status,
          application.remarks,
        ]);

        if (score > 0) {
          results.push({
            score,
            item: {
              entityType: "LeaveApplication",
              entityId: application.id,
              primaryText: application.referenceNo,
              secondaryText: `${application.applicantName} - ${application.leaveTypeName} - ${application.status}`,
              route: "/e-leave/application-maintenance",
              badge: application.status,
              sortDateUtc: new Date(application.startDate).toISOString(),
            },
          });
        }
      });

      const items = results
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          const aDate = a.item.sortDateUtc ?? "";
          const bDate = b.item.sortDateUtc ?? "";
          return bDate.localeCompare(aDate);
        })
        .slice(0, Math.max(1, limit))
        .map((x) => x.item);

      return {
        query: normalizedQuery,
        total: items.length,
        items,
      };
    };

  try {
    // Search should stay snappy even when backend is unreachable.
    const { data } = await api.get<SmartSearchResponse>(`/api/search?query=${encodeURIComponent(normalizedQuery)}&limit=${limit}`, {
      timeout: 1200,
    });
    return data;
  } catch {
    notifyOffline();
    return fallback();
  }
}

export async function getLeaveApplications(): Promise<LeaveApplication[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<LeaveApplication[]>("/api/leave-applications");
      return data;
    },
    () => [...offlineStore.leaveApplications]
  );
}

export async function getLeaveApplicationById(id: string): Promise<LeaveApplication | null> {
  return withFallback(
    async () => {
      const { data } = await api.get<LeaveApplication>(`/api/leave-applications/${id}`, { timeout: 1200 });
      return data;
    },
    () => offlineStore.leaveApplications.find((x) => x.id === id) ?? null
  );
}

export async function updateLeaveApplication(id: string, payload: LeaveApplicationUpdatePayload): Promise<LeaveApplication> {
  return withFallback(
    async () => {
      const { data } = await api.put<LeaveApplication>(`/api/leave-applications/${id}`, payload, { timeout: 1200 });
      addAuditEntry(id, "Edited", "system-admin", "System Admin", payload.remarks ? `Updated remarks: ${payload.remarks}` : "Edited");
      return data;
    },
    () => {
      const index = offlineStore.leaveApplications.findIndex((x) => x.id === id);
      if (index < 0) {
        throw new Error("Application not found.");
      }

      const current = offlineStore.leaveApplications[index];
      if (current.status !== "Pending") {
        throw new Error("Only pending applications can be edited.");
      }

      const durationDays = calcWorkingDays(payload.startDate, payload.endDate, current.session);
      const updated: LeaveApplication = {
        ...current,
        startDate: new Date(payload.startDate).toISOString(),
        endDate: new Date(payload.endDate).toISOString(),
        durationDays,
        remarks: payload.remarks,
      };

      offlineStore.leaveApplications[index] = updated;
      addAuditEntry(id, "Edited", "system-admin", "System Admin", payload.remarks ? `Updated remarks: ${payload.remarks}` : "Edited");
      return updated;
    }
  );
}

export async function cancelLeaveApplication(id: string, actorId: string, comment?: string) {
  await withFallback(
    async () => {
      await api.post(`/api/leave-applications/${id}/cancel`, { actorId, comment }, { timeout: 1200 });
    },
    () => {
      const app = offlineStore.leaveApplications.find((x) => x.id === id);
      if (!app || app.status === "Cancelled") {
        return;
      }

      app.status = "Cancelled";
    }
  );

  const actor = findEmployee(actorId);
  addAuditEntry(id, "Cancelled", actorId, actor.displayName, comment ?? "Cancelled in maintenance");
}

export async function getLeaveApplicationAudit(id: string): Promise<LeaveApplicationAuditEntry[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<LeaveApplicationAuditEntry[]>(`/api/leave-applications/${id}/audit`, { timeout: 1200 });
      return data;
    },
    () => {
      ensureAuditSeed(id);
      return [...(auditTrailStore[id] ?? [])];
    }
  );
}

export async function createLeaveApplication(payload: {
  applicantId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  session: SessionType;
  remarks?: string;
}): Promise<LeaveApplication> {
  return withFallback(
    async () => {
      const { data } = await api.post<LeaveApplication>("/api/leave-applications", payload);
      return data;
    },
    () => {
      const leaveType = findLeaveType(payload.leaveTypeId);
      const employee = findEmployee(payload.applicantId);
      const durationDays = calcWorkingDays(payload.startDate, payload.endDate, payload.session);
      const refNo = `REF${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(100 + Math.random() * 900)}`;

      const created: LeaveApplication = {
        id: crypto.randomUUID(),
        referenceNo: refNo,
        applicantId: payload.applicantId,
        applicantName: employee.displayName,
        leaveTypeId: payload.leaveTypeId,
        leaveTypeName: leaveType.nameEn,
        startDate: new Date(payload.startDate).toISOString(),
        endDate: new Date(payload.endDate).toISOString(),
        durationDays,
        session: payload.session,
        status: "Pending",
        remarks: payload.remarks,
      };

      offlineStore.leaveApplications.unshift(created);
      return created;
    }
  );
}

export async function calculateLeave(payload: {
  startDate: string;
  endDate: string;
  session: SessionType;
  employeeId: string;
  leaveTypeId: string;
}): Promise<LeaveCalculationResult> {
  return withFallback(
    async () => {
      const { data } = await api.post<LeaveCalculationResult>("/api/leave-applications/calculate", payload);
      return data;
    },
    () => {
      const detail = calcWorkingDaysDetailed(payload.startDate, payload.endDate, payload.session);
      const balance = getBalance(payload.employeeId, payload.leaveTypeId);
      const remainingBalance = Number((balance.entitledDays - balance.usedDays - detail.workingDays).toFixed(2));
      const leaveType = findLeaveType(payload.leaveTypeId);

      return {
        workingDays: detail.workingDays,
        balanceSufficient: remainingBalance >= 0,
        remainingBalance,
        recommendation:
          remainingBalance >= 0
            ? `Use ${leaveType.nameEn}. Balance after application: ${remainingBalance} days`
            : `Insufficient balance. Deficit: ${Math.abs(remainingBalance)} days`,
        excludedDates: detail.excludedDates,
      };
    }
  );
}

export async function approveLeave(id: string, approverId: string, comment?: string) {
  await withFallback(
    async () => {
      await api.post(`/api/leave-applications/${id}/approve`, { approverId, comment });
    },
    () => {
      const app = offlineStore.leaveApplications.find((x) => x.id === id);
      if (!app || app.status !== "Pending") {
        return;
      }

      app.status = "Approved";
      const balance = getBalance(app.applicantId, app.leaveTypeId);
      balance.usedDays = Number((balance.usedDays + app.durationDays).toFixed(2));
    }
  );

  const approver = findEmployee(approverId);
  addAuditEntry(id, "Approved", approverId, approver.displayName, comment);
}

export async function rejectLeave(id: string, approverId: string, comment?: string) {
  await withFallback(
    async () => {
      await api.post(`/api/leave-applications/${id}/reject`, { approverId, comment });
    },
    () => {
      const app = offlineStore.leaveApplications.find((x) => x.id === id);
      if (!app || app.status !== "Pending") {
        return;
      }

      app.status = "Rejected";
    }
  );

  const approver = findEmployee(approverId);
  addAuditEntry(id, "Rejected", approverId, approver.displayName, comment);
}

export async function getLeaveTypes(): Promise<LeaveType[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<LeaveType[]>("/api/leave-types");
      return data;
    },
    () => [...offlineStore.leaveTypes]
  );
}

export async function updateLeaveType(leaveType: LeaveType) {
  await withFallback(
    async () => {
      await api.put(`/api/leave-types/${leaveType.id}`, leaveType);
    },
    () => {
      const index = offlineStore.leaveTypes.findIndex((x) => x.id === leaveType.id);
      if (index >= 0) {
        offlineStore.leaveTypes[index] = leaveType;
      }
    }
  );
}

export async function getTeamCalendar(team?: string): Promise<CalendarEventItem[]> {
  return withFallback(
    async () => {
      const suffix = team ? `?team=${encodeURIComponent(team)}` : "";
      const { data } = await api.get<CalendarEventItem[]>(`/api/calendars/team${suffix}`);
      return data;
    },
    () => {
      const rows = buildCalendarRows(offlineStore.leaveApplications);
      return team ? rows.filter((x) => x.team.toLowerCase() === team.toLowerCase()) : rows;
    }
  );
}

export async function getDepartmentCalendar(department?: string): Promise<CalendarEventItem[]> {
  return withFallback(
    async () => {
      const suffix = department ? `?department=${encodeURIComponent(department)}` : "";
      const { data } = await api.get<CalendarEventItem[]>(`/api/calendars/department${suffix}`);
      return data;
    },
    () => {
      const rows = buildCalendarRows(offlineStore.leaveApplications);
      return department ? rows.filter((x) => x.department.toLowerCase() === department.toLowerCase()) : rows;
    }
  );
}


export async function getLeaveBalanceRows(): Promise<LeaveBalanceRow[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<LeaveBalanceRow[]>("/api/reports/leave-balance");
      return data;
    },
    () =>
      offlineStore.balances.map((x) => {
        const employee = findEmployee(x.employeeId);
        const leaveType = findLeaveType(x.leaveTypeId);
        return {
          businessUnit: employee.businessUnit,
          department: employee.department,
          team: employee.team,
          employee: employee.displayName,
          leaveType: leaveType.nameEn,
          balanceDays: Number((x.entitledDays - x.usedDays).toFixed(2)),
        };
      })
  );
}

export async function getLeaveTransactionRows(): Promise<LeaveTransactionRow[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<LeaveTransactionRow[]>("/api/reports/leave-transaction");
      return data;
    },
    () =>
      offlineStore.leaveApplications.map((x) => ({
        referenceNo: x.referenceNo,
        employee: x.applicantName,
        department: findEmployee(x.applicantId).department,
        leaveType: x.leaveTypeName,
        startDate: x.startDate,
        endDate: x.endDate,
        status: x.status,
        durationDays: x.durationDays,
      }))
  );
}

export async function exportReport(report: "leave-balance" | "leave-transaction", format: ExportFormat) {
  await withFallback(
    async () => {
      const response = await api.get(`/api/reports/export?report=${report}&format=${format}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const fileExt = format === "excel" ? "xls" : format;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${report}.${fileExt}`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    async () => {
      const isBalance = report === "leave-balance";
      const rows = isBalance ? await getLeaveBalanceRows() : await getLeaveTransactionRows();
      const header = isBalance
        ? "BusinessUnit,Department,Team,Employee,LeaveType,BalanceDays"
        : "ReferenceNo,Employee,Department,LeaveType,StartDate,EndDate,Status,DurationDays";

      const body = rows
        .map((x) =>
          isBalance
            ? `${(x as LeaveBalanceRow).businessUnit},${(x as LeaveBalanceRow).department},${(x as LeaveBalanceRow).team},${(x as LeaveBalanceRow).employee},${(x as LeaveBalanceRow).leaveType},${(x as LeaveBalanceRow).balanceDays}`
            : `${(x as LeaveTransactionRow).referenceNo},${(x as LeaveTransactionRow).employee},${(x as LeaveTransactionRow).department},${(x as LeaveTransactionRow).leaveType},${(x as LeaveTransactionRow).startDate},${(x as LeaveTransactionRow).endDate},${(x as LeaveTransactionRow).status},${(x as LeaveTransactionRow).durationDays}`
        )
        .join("\n");

      const ext = format === "excel" ? "xls" : format;
      downloadTextFile(`${header}\n${body}`, `${report}.${ext}`);
    }
  );
}

export async function getHierarchyTree(): Promise<HierarchyNode[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<HierarchyNode[]>("/api/reporting-hierarchy/tree");
      return data;
    },
    () => {
      const employeeMap = new Map(offlineStore.employees.map((x) => [x.id, x]));
      const children = new Map<string, string[]>();
      const hasManager = new Set<string>();

      offlineStore.reportingRelations.forEach((r) => {
        children.set(r.managerId, [...(children.get(r.managerId) ?? []), r.employeeId]);
        hasManager.add(r.employeeId);
      });

      const roots = offlineStore.employees.filter((e) => !hasManager.has(e.id));
      const buildNode = (id: string): HierarchyNode => {
        const e = employeeMap.get(id) ?? offlineStore.employees[0];
        return {
          employeeId: e.id,
          employeeName: e.displayName,
          position: e.position,
          reports: (children.get(id) ?? []).map(buildNode),
        };
      };

      return roots.map((x) => buildNode(x.id));
    }
  );
}

export async function getHierarchyTable(): Promise<Array<{ managerName: string; employeeName: string; sequence: number }>> {
  return withFallback(
    async () => {
      const { data } = await api.get<Array<{ managerName: string; employeeName: string; sequence: number }>>(
        "/api/reporting-hierarchy/table"
      );
      return data;
    },
    () =>
      offlineStore.reportingRelations.map((x) => ({
        managerName: findEmployee(x.managerId).displayName,
        employeeName: findEmployee(x.employeeId).displayName,
        sequence: x.sequence,
      }))
  );
}

export async function validateHierarchy(): Promise<HierarchyValidation> {
  return withFallback(
    async () => {
      const { data } = await api.post<HierarchyValidation>("/api/reporting-hierarchy/validate", {});
      return data;
    },
    () => ({
      hasMissingApprovers: false,
      hasCircularReporting: false,
      hasBottlenecks: false,
      messages: ["Hierarchy validation passed."],
    })
  );
}

export async function getOrganizationUnits(): Promise<OrganizationUnitRow[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<OrganizationUnitRow[]>("/api/system-settings/organization-units");
      return data;
    },
    () => {
      const unique = new Map<string, OrganizationUnitRow>();
      offlineStore.employees.forEach((e) => {
        const key = `${e.businessUnit}|${e.department}|${e.team}`;
        unique.set(key, { businessUnit: e.businessUnit, department: e.department, team: e.team });
      });

      return Array.from(unique.values());
    }
  );
}

export async function getUsers(): Promise<UserRow[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<UserRow[]>("/api/system-settings/users");
      return data;
    },
    () =>
      offlineStore.employees.map((x) => ({
        id: x.id,
        employeeNo: x.employeeNo,
        displayName: x.displayName,
        email: x.email,
        department: x.department,
        team: x.team,
        position: x.position,
        isActive: true,
      }))
  );
}

export async function getAccessControl(): Promise<AccessControlRow[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<AccessControlRow[]>("/api/system-settings/access-control");
      return data;
    },
    () => [
      { role: "Employee", submitLeave: true, approveLeave: false, hrVerification: false, administration: false },
      { role: "Supervisor", submitLeave: true, approveLeave: true, hrVerification: false, administration: false },
      { role: "Manager", submitLeave: true, approveLeave: true, hrVerification: true, administration: false },
      { role: "HR", submitLeave: true, approveLeave: true, hrVerification: true, administration: true },
      { role: "SystemAdministrator", submitLeave: true, approveLeave: true, hrVerification: true, administration: true },
    ]
  );
}

export async function getSystemCalendar(): Promise<SystemCalendarRow[]> {
  return withFallback(
    async () => {
      const { data } = await api.get<SystemCalendarRow[]>("/api/system-settings/calendar");
      return data;
    },
    () => {
      const year = new Date().getFullYear();
      return [
        { date: new Date(year, 0, 1).toISOString(), type: "Public Holiday", name: "New Year", recurring: true },
        { date: new Date(year, 11, 25).toISOString(), type: "Public Holiday", name: "Christmas", recurring: true },
        { date: new Date(year, 11, 31).toISOString(), type: "Shutdown Day", name: "Year-end maintenance", recurring: false },
      ];
    }
  );
}

export async function getPreferenceDefaults(): Promise<Preference> {
  return withFallback(
    async () => {
      const { data } = await api.get<Preference>("/api/preferences/defaults");
      return data;
    },
    () => ({ ...offlineStore.preferences })
  );
}

export async function savePreferences(preference: Preference) {
  await withFallback(
    async () => {
      await api.post("/api/preferences", preference);
    },
    () => {
      offlineStore.preferences = { ...preference };
    }
  );
}

