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

    public Task AddAsync(Employee employee, CancellationToken ct = default)
    {
        _store.Employees.Add(employee);
        _store.SaveChanges();
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Employee employee, CancellationToken ct = default)
    {
        var index = _store.Employees.FindIndex(x => x.Id == employee.Id);
        if (index >= 0)
        {
            _store.Employees[index] = employee;
            _store.SaveChanges();
        }

        return Task.CompletedTask;
    }
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
            _store.SaveChanges();
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
            _store.SaveChanges();
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
        _store.SaveChanges();
        return Task.CompletedTask;
    }

    public Task UpdateAsync(LeaveApplication application, CancellationToken ct = default)
    {
        var index = _store.LeaveApplications.FindIndex(x => x.Id == application.Id);
        if (index >= 0)
        {
            _store.LeaveApplications[index] = application;
            _store.SaveChanges();
        }

        return Task.CompletedTask;
    }
}

internal sealed class LeaveApplicationAuditRepository : ILeaveApplicationAuditRepository
{
    private readonly InMemoryDataStore _store;

    public LeaveApplicationAuditRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<LeaveApplicationAuditEntry>> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default)
    {
        var rows = _store.LeaveApplicationAudits
            .Where(x => x.LeaveApplicationId == applicationId)
            .ToList();
        return Task.FromResult<IReadOnlyList<LeaveApplicationAuditEntry>>(rows);
    }

    public Task AddAsync(LeaveApplicationAuditEntry entry, CancellationToken ct = default)
    {
        _store.LeaveApplicationAudits.Add(entry);
        _store.SaveChanges();
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

internal sealed class UserRoleRepository : IUserRoleRepository
{
    private readonly InMemoryDataStore _store;

    public UserRoleRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyDictionary<Guid, string>> GetAllAsync(CancellationToken ct = default)
    {
        var copy = _store.UserRoles.ToDictionary(x => x.Key, x => x.Value);
        return Task.FromResult<IReadOnlyDictionary<Guid, string>>(copy);
    }

    public Task<string?> GetByEmployeeIdAsync(Guid employeeId, CancellationToken ct = default)
    {
        _store.UserRoles.TryGetValue(employeeId, out var role);
        return Task.FromResult(role);
    }

    public Task SetRoleAsync(Guid employeeId, string role, CancellationToken ct = default)
    {
        _store.UserRoles[employeeId] = role;
        _store.SaveChanges();
        return Task.CompletedTask;
    }
}

internal sealed class UserPreferenceRepository : IUserPreferenceRepository
{
    private readonly InMemoryDataStore _store;

    public UserPreferenceRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<UserPreferenceDto> GetDefaultsAsync(CancellationToken ct = default)
    {
        var pref = _store.PreferenceDefaults;
        var dto = new UserPreferenceDto(
            pref.Language,
            pref.Theme,
            pref.NotificationEnabled,
            pref.DefaultCalendarView,
            pref.DashboardPersonalizationEnabled);
        return Task.FromResult(dto);
    }

    public Task SaveDefaultsAsync(UserPreferenceDto preference, CancellationToken ct = default)
    {
        _store.PreferenceDefaults = new PreferenceSettings(
            preference.Language,
            preference.Theme,
            preference.NotificationEnabled,
            preference.DefaultCalendarView,
            preference.DashboardPersonalizationEnabled);
        _store.SaveChanges();
        return Task.CompletedTask;
    }
}

internal sealed class DataStoreAdminRepository : IDataStoreAdminRepository
{
    private readonly InMemoryDataStore _store;

    public DataStoreAdminRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task ResetToSeedAsync(CancellationToken ct = default)
    {
        _store.ResetToSeed();
        return Task.CompletedTask;
    }

    public Task ClearAllAsync(CancellationToken ct = default)
    {
        _store.ClearAllData();
        return Task.CompletedTask;
    }
}

