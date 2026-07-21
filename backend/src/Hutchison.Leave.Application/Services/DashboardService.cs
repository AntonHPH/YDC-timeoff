using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Application.Services;

public sealed class DashboardService : IDashboardService
{
    private readonly ILeaveBalanceRepository _balanceRepository;
    private readonly ILeaveApplicationRepository _applicationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public DashboardService(
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

    public async Task<DashboardSummaryDto> GetSummaryAsync(Guid employeeId, CancellationToken ct = default)
    {
        var balances = await _balanceRepository.GetByEmployeeAsync(employeeId, ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);
        var applications = await _applicationRepository.GetAllAsync(ct);
        var employees = await _employeeRepository.GetAllAsync(ct);

        var leaveTypeCodeMap = leaveTypes.ToDictionary(x => x.Id, x => x.Code);

        decimal annual = 0;
        decimal compensation = 0;
        decimal sick = 0;

        foreach (var balance in balances)
        {
            leaveTypeCodeMap.TryGetValue(balance.LeaveTypeId, out var code);
            switch (code)
            {
                case "AL":
                    annual = balance.BalanceDays;
                    break;
                case "COMP":
                    compensation = balance.BalanceDays;
                    break;
                case "SICK":
                    sick = balance.BalanceDays;
                    break;
            }
        }

        var currentEmployee = employees.FirstOrDefault(x => x.Id == employeeId);
        var today = DateTime.UtcNow.Date;

        var onLeaveToday = applications.Count(x =>
            x.Status == LeaveStatus.Approved &&
            x.StartDate.Date <= today &&
            x.EndDate.Date >= today &&
            currentEmployee is not null &&
            employees.Any(e => e.Id == x.ApplicantId && e.Team == currentEmployee.Team));

        var pendingApprovals = applications.Count(x => x.Status == LeaveStatus.Pending);

        return new DashboardSummaryDto(annual, compensation, sick, pendingApprovals, onLeaveToday);
    }

    public async Task<IReadOnlyList<WorklistItemDto>> GetWorklistAsync(Guid employeeId, CancellationToken ct = default)
    {
        var applications = await _applicationRepository.GetAllAsync(ct);
        var employees = await _employeeRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);

        var employeeMap = employees.ToDictionary(x => x.Id, x => x.DisplayName);
        var leaveTypeMap = leaveTypes.ToDictionary(x => x.Id, x => x.NameEn);

        return applications
            .OrderByDescending(x => x.CreatedUtc)
            .Take(12)
            .Select(x => new WorklistItemDto(
                x.ReferenceNo,
                employeeMap.TryGetValue(x.ApplicantId, out var applicant) ? applicant : "Unknown",
                leaveTypeMap.TryGetValue(x.LeaveTypeId, out var leaveType) ? leaveType : "Unknown",
                x.StartDate,
                x.EndDate,
                x.Status))
            .ToList();
    }
}

