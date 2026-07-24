export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface DashboardSummary {
  annualLeaveBalance: number;
  compensationLeaveBalance: number;
  sickLeaveBalance: number;
  pendingApprovals: number;
  teamMembersOnLeaveToday: number;
}

export interface WorklistItem {
  referenceNo: string;
  applicant: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
}

export interface LeaveApplication {
  id: string;
  referenceNo: string;
  applicantId: string;
  applicantName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  session: "FullDay" | "AM" | "PM";
  status: LeaveStatus;
  remarks?: string;
}

export interface LeaveType {
  id: string;
  code: string;
  nameEn: string;
  nameTc?: string;
  nameSc?: string;
  requireHrVerification: boolean;
  requireComments: boolean;
  excludeHoliday: boolean;
  allowPostDateApplication: boolean;
  requireSupportingDocument: boolean;
  minDaysPerApplication: number;
  maxDaysPerApplication: number;
  isActive: boolean;
}

export interface CalendarEventItem {
  id: string;
  employeeName: string;
  leaveType: string;
  department: string;
  team: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  remarks?: string;
}

export interface LeaveCalculationResult {
  workingDays: number;
  balanceSufficient: boolean;
  remainingBalance: number;
  recommendation: string;
  excludedDates: string[];
}


export interface HierarchyNode {
  employeeId: string;
  employeeName: string;
  position: string;
  reports: HierarchyNode[];
}

export interface SmartSearchResultItem {
  entityType: "Employee" | "LeaveApplication" | "LeaveType";
  entityId: string;
  primaryText: string;
  secondaryText: string;
  route: string;
  badge?: string;
  sortDateUtc?: string;
}

export interface SmartSearchResponse {
  query: string;
  total: number;
  items: SmartSearchResultItem[];
}

export interface LeaveApplicationAuditEntry {
  id: string;
  applicationId: string;
  action: "Created" | "Edited" | "Approved" | "Rejected" | "Cancelled";
  actorId: string;
  actorName: string;
  comment?: string;
  timestamp: string;
}

