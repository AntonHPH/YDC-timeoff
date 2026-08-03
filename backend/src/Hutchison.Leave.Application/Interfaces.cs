using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Application;

public interface IEmployeeRepository
{
    Task<IReadOnlyList<Employee>> GetAllAsync(CancellationToken ct = default);
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Employee employee, CancellationToken ct = default);
    Task UpdateAsync(Employee employee, CancellationToken ct = default);
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

public interface ILeaveApplicationAuditRepository
{
    Task<IReadOnlyList<LeaveApplicationAuditEntry>> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default);
    Task AddAsync(LeaveApplicationAuditEntry entry, CancellationToken ct = default);
}

public interface IHolidayRepository
{
    Task<IReadOnlyList<PublicHoliday>> GetAllAsync(CancellationToken ct = default);
}

public interface IReportingRepository
{
    Task<IReadOnlyList<ReportingRelation>> GetAllAsync(CancellationToken ct = default);
}

public interface IUserRoleRepository
{
    Task<IReadOnlyDictionary<Guid, string>> GetAllAsync(CancellationToken ct = default);
    Task<string?> GetByEmployeeIdAsync(Guid employeeId, CancellationToken ct = default);
    Task SetRoleAsync(Guid employeeId, string role, CancellationToken ct = default);
}

public interface IUserPreferenceRepository
{
    Task<UserPreferenceDto> GetDefaultsAsync(CancellationToken ct = default);
    Task SaveDefaultsAsync(UserPreferenceDto preference, CancellationToken ct = default);
}

public interface IDataStoreAdminRepository
{
    Task ResetToSeedAsync(CancellationToken ct = default);
    Task ClearAllAsync(CancellationToken ct = default);
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
    Task<LeaveApplicationDto> UpdateAsync(Guid applicationId, LeaveApplicationUpdateRequest request, CancellationToken ct = default);
    Task ApproveAsync(Guid applicationId, ApprovalActionRequest request, CancellationToken ct = default);
    Task RejectAsync(Guid applicationId, ApprovalActionRequest request, CancellationToken ct = default);
    Task CancelAsync(Guid applicationId, LeaveApplicationCancelRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<LeaveApplicationAuditEntryDto>> GetAuditAsync(Guid applicationId, CancellationToken ct = default);
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

public interface ISmartSearchService
{
    Task<SmartSearchResponseDto> SearchAsync(string query, int limit = 10, CancellationToken ct = default);
}

