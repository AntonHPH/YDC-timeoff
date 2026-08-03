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
import { getCurrentUser } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5182",
  timeout: 10000,
});

const allowOfflineFallback = (import.meta.env.VITE_ALLOW_OFFLINE_FALLBACK ?? "false").toLowerCase() === "true";

api.interceptors.request.use((config) => {
  const user = getCurrentUser();
  if (!user) {
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers["X-App-Role"] = user.role;
  config.headers["X-App-User-Email"] = user.email;
  config.headers["X-App-Employee-Id"] = user.employeeId;
  return config;
});

type SessionType = "FullDay" | "AM" | "PM";
type ExportFormat = "pdf" | "excel" | "csv";

export interface LeaveApplicationUpdatePayload {
  startDate: string;
  endDate: string;
  remarks?: string;
  actorId: string;
  comment?: string;
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
  role: string;
}

export interface CreateUserPayload {
  employeeNo?: string;
  displayName: string;
  email: string;
  department: string;
  team: string;
  position: string;
  businessUnit?: string;
  role?: string;
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
      employeeNo: "IT000",
      displayName: "Bot0",
      email: "bot0@hutchisonports.com",
      position: "Department Head",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "IT Leadership",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      employeeNo: "IT001",
      displayName: "Bot1",
      email: "bot1@hutchisonports.com",
      position: "Manager",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Team 1",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      employeeNo: "IT003",
      displayName: "Bot2",
      email: "bot2@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Team 1",
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      employeeNo: "IT004",
      displayName: "Bot3",
      email: "bot3@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Team 1",
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      employeeNo: "IT005",
      displayName: "Bot4",
      email: "bot4@hutchisonports.com",
      position: "Manager",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Team 2",
    },
    {
      id: "66666666-6666-6666-6666-666666666666",
      employeeNo: "IT006",
      displayName: "Bot5",
      email: "bot5@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Team 2",
    },
    {
      id: "77777777-7777-7777-7777-777777777777",
      employeeNo: "IT007",
      displayName: "Bot6",
      email: "bot6@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Team 2",
    },
    {
      id: "88888888-8888-8888-8888-888888888888",
      employeeNo: "IT008",
      displayName: "Bot7",
      email: "bot7@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "IT",
      team: "Team 2",
    },
    {
      id: "dddddddd-1111-1111-1111-111111111111",
      employeeNo: "FIN000",
      displayName: "Bot12",
      email: "bot12@hutchisonports.com",
      position: "Senior Manager",
      businessUnit: "Hong Kong Terminal",
      department: "Finance",
      team: "Finance Leadership",
    },
    {
      id: "99999999-9999-9999-9999-999999999999",
      employeeNo: "FIN001",
      displayName: "Bot8",
      email: "bot8@hutchisonports.com",
      position: "Manager",
      businessUnit: "Hong Kong Terminal",
      department: "Finance",
      team: "Team 3",
    },
    {
      id: "aaaaaaaa-1111-1111-1111-111111111111",
      employeeNo: "FIN002",
      displayName: "Bot9",
      email: "bot9@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "Finance",
      team: "Team 3",
    },
    {
      id: "bbbbbbbb-1111-1111-1111-111111111111",
      employeeNo: "FIN003",
      displayName: "Bot10",
      email: "bot10@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "Finance",
      team: "Team 3",
    },
    {
      id: "cccccccc-1111-1111-1111-111111111111",
      employeeNo: "FIN004",
      displayName: "Bot11",
      email: "bot11@hutchisonports.com",
      position: "Data Analyst",
      businessUnit: "Hong Kong Terminal",
      department: "Finance",
      team: "Team 3",
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
    { employeeId: "11111111-1111-1111-1111-111111111111", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 24, usedDays: 4 },
    { employeeId: "22222222-2222-2222-2222-222222222222", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 20, usedDays: 3 },
    { employeeId: "33333333-3333-3333-3333-333333333333", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 16, usedDays: 2 },
    { employeeId: "44444444-4444-4444-4444-444444444444", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 16, usedDays: 1 },
    { employeeId: "55555555-5555-5555-5555-555555555555", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 20, usedDays: 5 },
    { employeeId: "66666666-6666-6666-6666-666666666666", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 16, usedDays: 2 },
    { employeeId: "77777777-7777-7777-7777-777777777777", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 16, usedDays: 3 },
    { employeeId: "88888888-8888-8888-8888-888888888888", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 16, usedDays: 1 },
    { employeeId: "dddddddd-1111-1111-1111-111111111111", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 22, usedDays: 3 },
    { employeeId: "99999999-9999-9999-9999-999999999999", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 18, usedDays: 2 },
    { employeeId: "aaaaaaaa-1111-1111-1111-111111111111", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 15, usedDays: 2 },
    { employeeId: "bbbbbbbb-1111-1111-1111-111111111111", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 15, usedDays: 1 },
    { employeeId: "cccccccc-1111-1111-1111-111111111111", leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", entitledDays: 15, usedDays: 2 },
  ] as BalanceSeed[],

  leaveApplications: [
    {
      id: "90000000-0000-0000-0000-000000000001",
      referenceNo: "REF20260803001",
      applicantId: "33333333-3333-3333-3333-333333333333",
      applicantName: "Bot2",
      leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      leaveTypeName: "Annual Leave",
      startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      durationDays: 1,
      session: "FullDay",
      status: "Pending",
      remarks: "Team event",
    },
    {
      id: "90000000-0000-0000-0000-000000000002",
      referenceNo: "REF20260803002",
      applicantId: "66666666-6666-6666-6666-666666666666",
      applicantName: "Bot5",
      leaveTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      leaveTypeName: "Annual Leave",
      startDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      durationDays: 1,
      session: "FullDay",
      status: "Approved",
      remarks: "Family day",
    },
    {
      id: "90000000-0000-0000-0000-000000000003",
      referenceNo: "REF20260803003",
      applicantId: "44444444-4444-4444-4444-444444444444",
      applicantName: "Bot3",
      leaveTypeId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      leaveTypeName: "Sick Leave",
      startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      endDate: new Date(Date.now() - 86400000).toISOString(),
      durationDays: 2,
      session: "FullDay",
      status: "Approved",
      remarks: "Medical",
    },
  ] as LeaveApplication[],

  reportingRelations: [
    { managerId: "11111111-1111-1111-1111-111111111111", employeeId: "22222222-2222-2222-2222-222222222222", sequence: 1 },
    { managerId: "11111111-1111-1111-1111-111111111111", employeeId: "55555555-5555-5555-5555-555555555555", sequence: 2 },
    { managerId: "22222222-2222-2222-2222-222222222222", employeeId: "33333333-3333-3333-3333-333333333333", sequence: 1 },
    { managerId: "22222222-2222-2222-2222-222222222222", employeeId: "44444444-4444-4444-4444-444444444444", sequence: 2 },
    { managerId: "55555555-5555-5555-5555-555555555555", employeeId: "66666666-6666-6666-6666-666666666666", sequence: 1 },
    { managerId: "55555555-5555-5555-5555-555555555555", employeeId: "77777777-7777-7777-7777-777777777777", sequence: 2 },
    { managerId: "55555555-5555-5555-5555-555555555555", employeeId: "88888888-8888-8888-8888-888888888888", sequence: 3 },
    { managerId: "dddddddd-1111-1111-1111-111111111111", employeeId: "99999999-9999-9999-9999-999999999999", sequence: 1 },
    { managerId: "99999999-9999-9999-9999-999999999999", employeeId: "aaaaaaaa-1111-1111-1111-111111111111", sequence: 1 },
    { managerId: "99999999-9999-9999-9999-999999999999", employeeId: "bbbbbbbb-1111-1111-1111-111111111111", sequence: 2 },
    { managerId: "99999999-9999-9999-9999-999999999999", employeeId: "cccccccc-1111-1111-1111-111111111111", sequence: 3 },
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

const offlineUserState: Record<string, { role: string; isActive: boolean }> = {};

const auditTrailStore: Record<string, LeaveApplicationAuditEntry[]> = {};

function ensureOfflineUserState(userId: string) {
  if (!offlineUserState[userId]) {
    offlineUserState[userId] = { role: "Employee", isActive: true };
  }

  return offlineUserState[userId];
}

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
  } catch (error) {
    if (!allowOfflineFallback) {
      throw error;
    }

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

function escapeCsvCell(value: string | number): string {
  const text = String(value).replace(/"/g, '""');
  return /[",\n\r]/.test(text) ? `"${text}"` : text;
}

function asExcelTextDate(value: string): string {
  return `="${value.slice(0, 10)}"`;
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
      const actor = findEmployee(payload.actorId);
      addAuditEntry(id, "Edited", payload.actorId, actor.displayName, payload.comment ?? payload.remarks ?? "Edited");
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
      const actor = findEmployee(payload.actorId);
      addAuditEntry(id, "Edited", payload.actorId, actor.displayName, payload.comment ?? payload.remarks ?? "Edited");
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
        .map((x) => {
          if (isBalance) {
            const row = x as LeaveBalanceRow;
            return [row.businessUnit, row.department, row.team, row.employee, row.leaveType, row.balanceDays]
              .map(escapeCsvCell)
              .join(",");
          }

          const row = x as LeaveTransactionRow;
          return [
            row.referenceNo,
            row.employee,
            row.department,
            row.leaveType,
            asExcelTextDate(row.startDate),
            asExcelTextDate(row.endDate),
            row.status,
            row.durationDays,
          ]
            .map(escapeCsvCell)
            .join(",");
        })
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
      offlineStore.employees.map((x) => {
        const state = ensureOfflineUserState(x.id);
        return {
          id: x.id,
          employeeNo: x.employeeNo,
          displayName: x.displayName,
          email: x.email,
          department: x.department,
          team: x.team,
          position: x.position,
          isActive: state.isActive,
          role: state.role,
        };
      })
  );
}

export async function createUser(payload: CreateUserPayload): Promise<UserRow> {
  return withFallback(
    async () => {
      const { data } = await api.post<UserRow>("/api/system-settings/users", payload);
      return data;
    },
    () => {
      const createdId = crypto.randomUUID();
      const employee = {
        id: createdId,
        employeeNo: payload.employeeNo ?? `E${Math.floor(10000 + Math.random() * 90000)}`,
        displayName: payload.displayName,
        email: payload.email,
        position: payload.position,
        businessUnit: payload.businessUnit ?? "Hong Kong Terminal",
        department: payload.department,
        team: payload.team,
      };

      offlineStore.employees.push(employee);
      offlineUserState[createdId] = {
        role: payload.role ?? "Employee",
        isActive: true,
      };

      return {
        id: createdId,
        employeeNo: employee.employeeNo,
        displayName: employee.displayName,
        email: employee.email,
        department: employee.department,
        team: employee.team,
        position: employee.position,
        isActive: true,
        role: payload.role ?? "Employee",
      };
    }
  );
}

export async function updateUserRole(userId: string, role: string): Promise<UserRow> {
  return withFallback(
    async () => {
      const { data } = await api.put<UserRow>(`/api/system-settings/users/${userId}/role`, { role });
      return data;
    },
    () => {
      const employee = offlineStore.employees.find((x) => x.id === userId);
      if (!employee) {
        throw new Error("User not found.");
      }

      const state = ensureOfflineUserState(userId);
      state.role = role;

      return {
        id: employee.id,
        employeeNo: employee.employeeNo,
        displayName: employee.displayName,
        email: employee.email,
        department: employee.department,
        team: employee.team,
        position: employee.position,
        isActive: state.isActive,
        role: state.role,
      };
    }
  );
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<UserRow> {
  return withFallback(
    async () => {
      const { data } = await api.put<UserRow>(`/api/system-settings/users/${userId}/status`, { isActive });
      return data;
    },
    () => {
      const employee = offlineStore.employees.find((x) => x.id === userId);
      if (!employee) {
        throw new Error("User not found.");
      }

      const state = ensureOfflineUserState(userId);
      state.isActive = isActive;

      return {
        id: employee.id,
        employeeNo: employee.employeeNo,
        displayName: employee.displayName,
        email: employee.email,
        department: employee.department,
        team: employee.team,
        position: employee.position,
        isActive: state.isActive,
        role: state.role,
      };
    }
  );
}

export async function adminClearData(): Promise<string> {
  return withFallback(
    async () => {
      const { data } = await api.post<{ message: string }>("/api/admin/clear");
      return data.message;
    },
    () => {
      offlineStore.employees = [];
      offlineStore.balances = [];
      offlineStore.leaveApplications = [];
      offlineStore.reportingRelations = [];
      offlineStore.publicHolidays = [];
      offlineStore.preferences = {
        language: "English",
        theme: "light",
        notificationEnabled: true,
        defaultCalendarView: "month",
        dashboardPersonalizationEnabled: true,
      };

      Object.keys(auditTrailStore).forEach((key) => delete auditTrailStore[key]);
      Object.keys(offlineUserState).forEach((key) => delete offlineUserState[key]);

      return "Database cleared.";
    }
  );
}

export async function adminReseedData(): Promise<string> {
  return withFallback(
    async () => {
      const { data } = await api.post<{ message: string }>("/api/admin/reseed");
      return data.message;
    },
    () => {
      throw new Error("Reseed requires backend connectivity.");
    }
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

