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
        services.AddScoped<IHolidayRepository, HolidayRepository>();
        services.AddScoped<IReportingRepository, ReportingRepository>();

        return services;
    }
}

