using Hutchison.Leave.Application;
using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Infrastructure;

internal sealed class EmployeeRepository : IEmployeeRepository
{
    private readonly InMemoryDataStore _store;

    public EmployeeRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<Employee>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<Employee>>(_store.Employees);

    public Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => Task.FromResult(_store.Employees.FirstOrDefault(x => x.Id == id));
}

internal sealed class LeaveTypeRepository : ILeaveTypeRepository
{
    private readonly InMemoryDataStore _store;

    public LeaveTypeRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<LeaveType>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<LeaveType>>(_store.LeaveTypes);

    public Task<LeaveType?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => Task.FromResult(_store.LeaveTypes.FirstOrDefault(x => x.Id == id));

    public Task UpdateAsync(LeaveType leaveType, CancellationToken ct = default)
    {
        var existing = _store.LeaveTypes.FindIndex(x => x.Id == leaveType.Id);
        if (existing >= 0)
        {
            _store.LeaveTypes[existing] = leaveType;
        }

        return Task.CompletedTask;
    }
}

internal sealed class LeaveBalanceRepository : ILeaveBalanceRepository
{
    private readonly InMemoryDataStore _store;

    public LeaveBalanceRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<LeaveBalance>> GetByEmployeeAsync(Guid employeeId, CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<LeaveBalance>>(_store.LeaveBalances.Where(x => x.EmployeeId == employeeId).ToList());

    public Task<LeaveBalance?> GetAsync(Guid employeeId, Guid leaveTypeId, CancellationToken ct = default)
        => Task.FromResult(_store.LeaveBalances.FirstOrDefault(x => x.EmployeeId == employeeId && x.LeaveTypeId == leaveTypeId));

    public Task UpdateAsync(LeaveBalance balance, CancellationToken ct = default)
    {
        var index = _store.LeaveBalances.FindIndex(x => x.Id == balance.Id);
        if (index >= 0)
        {
            _store.LeaveBalances[index] = balance;
        }

        return Task.CompletedTask;
    }
}

internal sealed class LeaveApplicationRepository : ILeaveApplicationRepository
{
    private readonly InMemoryDataStore _store;

    public LeaveApplicationRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<LeaveApplication>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<LeaveApplication>>(_store.LeaveApplications);

    public Task<LeaveApplication?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => Task.FromResult(_store.LeaveApplications.FirstOrDefault(x => x.Id == id));

    public Task AddAsync(LeaveApplication application, CancellationToken ct = default)
    {
        _store.LeaveApplications.Add(application);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(LeaveApplication application, CancellationToken ct = default)
    {
        var index = _store.LeaveApplications.FindIndex(x => x.Id == application.Id);
        if (index >= 0)
        {
            _store.LeaveApplications[index] = application;
        }

        return Task.CompletedTask;
    }
}

internal sealed class HolidayRepository : IHolidayRepository
{
    private readonly InMemoryDataStore _store;

    public HolidayRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<PublicHoliday>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<PublicHoliday>>(_store.PublicHolidays);
}

internal sealed class ReportingRepository : IReportingRepository
{
    private readonly InMemoryDataStore _store;

    public ReportingRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<ReportingRelation>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<ReportingRelation>>(_store.ReportingRelations);
}

