using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Application;

public sealed record DashboardSummaryDto(
    decimal AnnualLeaveBalance,
    decimal CompensationLeaveBalance,
    decimal SickLeaveBalance,
    int PendingApprovals,
    int TeamMembersOnLeaveToday);

public sealed record WorklistItemDto(
    string ReferenceNo,
    string Applicant,
    string LeaveType,
    DateTime StartDate,
    DateTime EndDate,
    LeaveStatus Status);

public sealed record LeaveCalculationRequest(
    DateTime StartDate,
    DateTime EndDate,
    LeaveSession Session,
    Guid EmployeeId,
    Guid LeaveTypeId);

public sealed record LeaveCalculationResult(
    decimal WorkingDays,
    bool BalanceSufficient,
    decimal RemainingBalance,
    string Recommendation,
    IReadOnlyList<DateTime> ExcludedDates);

public sealed record LeaveApplicationCreateRequest(
    Guid ApplicantId,
    Guid LeaveTypeId,
    DateTime StartDate,
    DateTime EndDate,
    LeaveSession Session,
    string? Remarks);

public sealed record LeaveApplicationDto(
    Guid Id,
    string ReferenceNo,
    Guid ApplicantId,
    string ApplicantName,
    Guid LeaveTypeId,
    string LeaveTypeName,
    DateTime StartDate,
    DateTime EndDate,
    decimal DurationDays,
    LeaveSession Session,
    LeaveStatus Status,
    string? Remarks);

public sealed record ApprovalActionRequest(Guid ApproverId, string? Comment);


public sealed record LeaveBalanceRowDto(
    string BusinessUnit,
    string Department,
    string Team,
    string Employee,
    string LeaveType,
    decimal BalanceDays);

public sealed record LeaveTransactionRowDto(
    string ReferenceNo,
    string Employee,
    string Department,
    string LeaveType,
    DateTime StartDate,
    DateTime EndDate,
    LeaveStatus Status,
    decimal DurationDays);

public sealed record HierarchyNodeDto(Guid EmployeeId, string EmployeeName, string Position, List<HierarchyNodeDto> Reports);

public sealed record HierarchyValidationResult(
    bool HasMissingApprovers,
    bool HasCircularReporting,
    bool HasBottlenecks,
    IReadOnlyList<string> Messages);

