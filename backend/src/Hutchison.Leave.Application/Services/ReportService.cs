namespace Hutchison.Leave.Application.Services;

public sealed class ReportService : IReportService
{
    private readonly ILeaveBalanceRepository _balanceRepository;
    private readonly ILeaveApplicationRepository _applicationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public ReportService(
        ILeaveBalanceRepository balanceRepository,
        ILeaveApplicationRepository applicationRepository,
        IEmployeeRepository employeeRepository,
        ILeaveTypeRepository leaveTypeRepository)
    {
        _balanceRepository = balanceRepository;
        _applicationRepository = applicationRepository;
        _employeeRepository = employeeRepository;
        _leaveTypeRepository = leaveTypeRepository;
    }

    public async Task<IReadOnlyList<LeaveBalanceRowDto>> GetLeaveBalanceAsync(CancellationToken ct = default)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);

        var leaveTypeMap = leaveTypes.ToDictionary(x => x.Id, x => x.NameEn);
        var rows = new List<LeaveBalanceRowDto>();

        foreach (var employee in employees)
        {
            var balances = await _balanceRepository.GetByEmployeeAsync(employee.Id, ct);
            foreach (var balance in balances)
            {
                leaveTypeMap.TryGetValue(balance.LeaveTypeId, out var leaveTypeName);
                rows.Add(new LeaveBalanceRowDto(
                    employee.BusinessUnit,
                    employee.Department,
                    employee.Team,
                    employee.DisplayName,
                    leaveTypeName ?? "Unknown",
                    balance.BalanceDays));
            }
        }

        return rows
            .OrderBy(x => x.BusinessUnit)
            .ThenBy(x => x.Department)
            .ThenBy(x => x.Employee)
            .ToList();
    }

    public async Task<IReadOnlyList<LeaveTransactionRowDto>> GetLeaveTransactionsAsync(CancellationToken ct = default)
    {
        var applications = await _applicationRepository.GetAllAsync(ct);
        var employees = await _employeeRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);

        var employeeMap = employees.ToDictionary(x => x.Id, x => x);
        var leaveTypeMap = leaveTypes.ToDictionary(x => x.Id, x => x.NameEn);

        return applications
            .OrderByDescending(x => x.CreatedUtc)
            .Select(x =>
            {
                employeeMap.TryGetValue(x.ApplicantId, out var employee);
                leaveTypeMap.TryGetValue(x.LeaveTypeId, out var leaveTypeName);

                return new LeaveTransactionRowDto(
                    x.ReferenceNo,
                    employee?.DisplayName ?? "Unknown",
                    employee?.Department ?? "Unknown",
                    leaveTypeName ?? "Unknown",
                    x.StartDate,
                    x.EndDate,
                    x.Status,
                    x.DurationDays);
            })
            .ToList();
    }
}

