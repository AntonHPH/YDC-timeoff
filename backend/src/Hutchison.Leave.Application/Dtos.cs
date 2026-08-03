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

public sealed record LeaveApplicationUpdateRequest(
    DateTime StartDate,
    DateTime EndDate,
    string? Remarks,
    Guid ActorId,
    string? Comment);

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

public sealed record LeaveApplicationCancelRequest(Guid ActorId, string? Comment);

public sealed record LeaveApplicationAuditEntryDto(
    Guid Id,
    Guid ApplicationId,
    string Action,
    Guid ActorId,
    string ActorName,
    string? Comment,
    DateTime Timestamp);


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

public sealed record SmartSearchResultItemDto(
    string EntityType,
    Guid EntityId,
    string PrimaryText,
    string SecondaryText,
    string Route,
    string? Badge,
    DateTime? SortDateUtc);

public sealed record SmartSearchResponseDto(
    string Query,
    int Total,
    IReadOnlyList<SmartSearchResultItemDto> Items);

public sealed record UserPreferenceDto(
    string Language,
    string Theme,
    bool NotificationEnabled,
    string DefaultCalendarView,
    bool DashboardPersonalizationEnabled);

