using Hutchison.Leave.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Hutchison.Leave.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ILeaveCalculationService, LeaveCalculationService>();
        services.AddScoped<ILeaveApplicationService, LeaveApplicationService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<IReportingHierarchyService, ReportingHierarchyService>();

        return services;
    }
}

