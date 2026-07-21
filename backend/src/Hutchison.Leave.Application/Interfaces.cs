using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Application;

public interface IEmployeeRepository
{
    Task<IReadOnlyList<Employee>> GetAllAsync(CancellationToken ct = default);
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default);
}

public interface ILeaveTypeRepository
{
    Task<IReadOnlyList<LeaveType>> GetAllAsync(CancellationToken ct = default);
    Task<LeaveType?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task UpdateAsync(LeaveType leaveType, CancellationToken ct = default);
}

public interface ILeaveBalanceRepository
{
    Task<IReadOnlyList<LeaveBalance>> GetByEmployeeAsync(Guid employeeId, CancellationToken ct = default);
    Task<LeaveBalance?> GetAsync(Guid employeeId, Guid leaveTypeId, CancellationToken ct = default);
    Task UpdateAsync(LeaveBalance balance, CancellationToken ct = default);
}

public interface ILeaveApplicationRepository
{
    Task<IReadOnlyList<LeaveApplication>> GetAllAsync(CancellationToken ct = default);
    Task<LeaveApplication?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(LeaveApplication application, CancellationToken ct = default);
    Task UpdateAsync(LeaveApplication application, CancellationToken ct = default);
}

public interface IHolidayRepository
{
    Task<IReadOnlyList<PublicHoliday>> GetAllAsync(CancellationToken ct = default);
}

public interface IReportingRepository
{
    Task<IReadOnlyList<ReportingRelation>> GetAllAsync(CancellationToken ct = default);
}

public interface ILeaveCalculationService
{
    Task<LeaveCalculationResult> CalculateAsync(LeaveCalculationRequest request, CancellationToken ct = default);
}

public interface ILeaveApplicationService
{
    Task<IReadOnlyList<LeaveApplicationDto>> GetAllAsync(CancellationToken ct = default);
    Task<LeaveApplicationDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<LeaveApplicationDto> CreateAsync(LeaveApplicationCreateRequest request, CancellationToken ct = default);
    Task ApproveAsync(Guid applicationId, ApprovalActionRequest request, CancellationToken ct = default);
    Task RejectAsync(Guid applicationId, ApprovalActionRequest request, CancellationToken ct = default);
}

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(Guid employeeId, CancellationToken ct = default);
    Task<IReadOnlyList<WorklistItemDto>> GetWorklistAsync(Guid employeeId, CancellationToken ct = default);
}

public interface IReportService
{
    Task<IReadOnlyList<LeaveBalanceRowDto>> GetLeaveBalanceAsync(CancellationToken ct = default);
    Task<IReadOnlyList<LeaveTransactionRowDto>> GetLeaveTransactionsAsync(CancellationToken ct = default);
}

public interface IExportService
{
    byte[] ExportLeaveBalance(IReadOnlyList<LeaveBalanceRowDto> rows, string format);
    byte[] ExportLeaveTransactions(IReadOnlyList<LeaveTransactionRowDto> rows, string format);
    string GetContentType(string format);
    string GetFileExtension(string format);
}


public interface IReportingHierarchyService
{
    Task<IReadOnlyList<HierarchyNodeDto>> GetTreeAsync(CancellationToken ct = default);
    Task<HierarchyValidationResult> ValidateAsync(CancellationToken ct = default);
}

