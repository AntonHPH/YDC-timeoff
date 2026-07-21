using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Application.Services;

public sealed class LeaveCalculationService : ILeaveCalculationService
{
    private readonly IHolidayRepository _holidayRepository;
    private readonly ILeaveBalanceRepository _balanceRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public LeaveCalculationService(
        IHolidayRepository holidayRepository,
        ILeaveBalanceRepository balanceRepository,
        ILeaveTypeRepository leaveTypeRepository)
    {
        _holidayRepository = holidayRepository;
        _balanceRepository = balanceRepository;
        _leaveTypeRepository = leaveTypeRepository;
    }

    public async Task<LeaveCalculationResult> CalculateAsync(LeaveCalculationRequest request, CancellationToken ct = default)
    {
        if (request.EndDate.Date < request.StartDate.Date)
        {
            throw new ArgumentException("End date cannot be earlier than start date.");
        }

        var leaveType = await _leaveTypeRepository.GetByIdAsync(request.LeaveTypeId, ct)
            ?? throw new InvalidOperationException("Leave type not found.");

        var holidays = await _holidayRepository.GetAllAsync(ct);
        var holidaySet = holidays.Select(h => h.Date.Date).ToHashSet();

        var excludedDates = new List<DateTime>();
        decimal workingDays = 0;

        for (var date = request.StartDate.Date; date <= request.EndDate.Date; date = date.AddDays(1))
        {
            var isWeekend = date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;
            var isHoliday = holidaySet.Contains(date);

            if (isWeekend || (leaveType.ExcludeHoliday && isHoliday))
            {
                excludedDates.Add(date);
                continue;
            }

            workingDays += 1;
        }

        if (request.Session is LeaveSession.AM or LeaveSession.PM)
        {
            workingDays -= 0.5m;
        }

        var balance = await _balanceRepository.GetAsync(request.EmployeeId, request.LeaveTypeId, ct);
        var currentBalance = balance?.BalanceDays ?? 0;
        var remainingBalance = currentBalance - workingDays;
        var balanceSufficient = remainingBalance >= 0;

        var recommendation = balanceSufficient
            ? $"Use {leaveType.NameEn}. Balance after application: {remainingBalance:0.##} days"
            : $"Insufficient balance. Consider another leave type or shorter date range. Deficit: {Math.Abs(remainingBalance):0.##} days";

        return new LeaveCalculationResult(
            workingDays,
            balanceSufficient,
            remainingBalance,
            recommendation,
            excludedDates);
    }
}

