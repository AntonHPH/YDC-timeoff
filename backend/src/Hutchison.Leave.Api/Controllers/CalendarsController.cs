using Hutchison.Leave.Application;
using Hutchison.Leave.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/calendars")]
public sealed class CalendarsController : ControllerBase
{
    private readonly ILeaveApplicationRepository _applicationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public CalendarsController(
        ILeaveApplicationRepository applicationRepository,
        IEmployeeRepository employeeRepository,
        ILeaveTypeRepository leaveTypeRepository)
    {
        _applicationRepository = applicationRepository;
        _employeeRepository = employeeRepository;
        _leaveTypeRepository = leaveTypeRepository;
    }

    [HttpGet("team")]
    public async Task<ActionResult<IReadOnlyList<CalendarEventDto>>> GetTeamCalendar([FromQuery] string? team, CancellationToken ct)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);
        var applications = await _applicationRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);

        var filteredEmployees = string.IsNullOrWhiteSpace(team)
            ? employees
            : employees.Where(x => x.Team.Equals(team, StringComparison.OrdinalIgnoreCase)).ToList();

        var employeeMap = filteredEmployees.ToDictionary(x => x.Id, x => x);
        var leaveTypeMap = leaveTypes.ToDictionary(x => x.Id, x => x.NameEn);

        var events = applications
            .Where(x => employeeMap.ContainsKey(x.ApplicantId))
            .Select(x =>
            {
                var employee = employeeMap[x.ApplicantId];
                leaveTypeMap.TryGetValue(x.LeaveTypeId, out var leaveTypeName);

                return new CalendarEventDto(
                    x.Id,
                    employee.DisplayName,
                    leaveTypeName ?? "Unknown",
                    employee.Department,
                    employee.Team,
                    x.StartDate,
                    x.EndDate,
                    x.Status,
                    x.Remarks);
            })
            .ToList();

        return Ok(events);
    }

    [HttpGet("department")]
    public async Task<ActionResult<IReadOnlyList<CalendarEventDto>>> GetDepartmentCalendar([FromQuery] string? department, CancellationToken ct)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);
        var applications = await _applicationRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);

        var filteredEmployees = string.IsNullOrWhiteSpace(department)
            ? employees
            : employees.Where(x => x.Department.Equals(department, StringComparison.OrdinalIgnoreCase)).ToList();

        var employeeMap = filteredEmployees.ToDictionary(x => x.Id, x => x);
        var leaveTypeMap = leaveTypes.ToDictionary(x => x.Id, x => x.NameEn);

        var events = applications
            .Where(x => employeeMap.ContainsKey(x.ApplicantId))
            .Select(x =>
            {
                var employee = employeeMap[x.ApplicantId];
                leaveTypeMap.TryGetValue(x.LeaveTypeId, out var leaveTypeName);

                return new CalendarEventDto(
                    x.Id,
                    employee.DisplayName,
                    leaveTypeName ?? "Unknown",
                    employee.Department,
                    employee.Team,
                    x.StartDate,
                    x.EndDate,
                    x.Status,
                    x.Remarks);
            })
            .ToList();

        return Ok(events);
    }

    public sealed record CalendarEventDto(
        Guid Id,
        string EmployeeName,
        string LeaveType,
        string Department,
        string Team,
        DateTime StartDate,
        DateTime EndDate,
        LeaveStatus Status,
        string? Remarks);
}

