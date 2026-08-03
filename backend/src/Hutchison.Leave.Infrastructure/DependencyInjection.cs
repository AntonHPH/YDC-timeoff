using Hutchison.Leave.Application;
using Microsoft.Extensions.DependencyInjection;

namespace Hutchison.Leave.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddSingleton<InMemoryDataStore>();

        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<ILeaveTypeRepository, LeaveTypeRepository>();
        services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
        services.AddScoped<ILeaveApplicationRepository, LeaveApplicationRepository>();
        services.AddScoped<ILeaveApplicationAuditRepository, LeaveApplicationAuditRepository>();
        services.AddScoped<IHolidayRepository, HolidayRepository>();
        services.AddScoped<IReportingRepository, ReportingRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();
        services.AddScoped<IUserPreferenceRepository, UserPreferenceRepository>();
        services.AddScoped<IDataStoreAdminRepository, DataStoreAdminRepository>();

        return services;
    }
}

