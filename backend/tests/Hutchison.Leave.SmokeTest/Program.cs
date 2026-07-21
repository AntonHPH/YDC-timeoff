using Hutchison.Leave.Application;
using Hutchison.Leave.Domain;
using Hutchison.Leave.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddInfrastructureServices();
services.AddApplicationServices();

await using var provider = services.BuildServiceProvider();

var calculator = provider.GetRequiredService<ILeaveCalculationService>();
var appService = provider.GetRequiredService<ILeaveApplicationService>();

var calculation = await calculator.CalculateAsync(new LeaveCalculationRequest(
    StartDate: DateTime.UtcNow.Date.AddDays(7),
    EndDate: DateTime.UtcNow.Date.AddDays(11),
    Session: LeaveSession.FullDay,
    EmployeeId: SeedIds.EmployeeAlice,
    LeaveTypeId: SeedIds.LeaveTypeAnnual));

Console.WriteLine($"Working Days: {calculation.WorkingDays:0.##}");
Console.WriteLine($"Remaining Balance: {calculation.RemainingBalance:0.##}");

if (calculation.WorkingDays <= 0)
{
    throw new Exception("Smoke test failed: working day calculation is invalid.");
}

var created = await appService.CreateAsync(new LeaveApplicationCreateRequest(
    ApplicantId: SeedIds.EmployeeAlice,
    LeaveTypeId: SeedIds.LeaveTypeAnnual,
    StartDate: DateTime.UtcNow.Date.AddDays(15),
    EndDate: DateTime.UtcNow.Date.AddDays(16),
    Session: LeaveSession.FullDay,
    Remarks: "Smoke test application"));

Console.WriteLine($"Created Application: {created.ReferenceNo} ({created.Status})");

if (created.Status != LeaveStatus.Pending)
{
    throw new Exception("Smoke test failed: new application should be pending.");
}


Console.WriteLine("SMOKE TEST PASS");

