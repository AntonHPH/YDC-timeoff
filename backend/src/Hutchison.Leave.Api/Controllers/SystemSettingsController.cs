using Hutchison.Leave.Application;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/system-settings")]
public sealed class SystemSettingsController : ControllerBase
{
    private readonly IEmployeeRepository _employeeRepository;

    public SystemSettingsController(IEmployeeRepository employeeRepository)
    {
        _employeeRepository = employeeRepository;
    }

    [HttpGet("organization-units")]
    public async Task<ActionResult<IReadOnlyList<OrganizationUnitDto>>> GetOrganizationUnits(CancellationToken ct)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);

        var rows = employees
            .GroupBy(e => new { e.BusinessUnit, e.Department, e.Team })
            .Select(g => new OrganizationUnitDto(g.Key.BusinessUnit, g.Key.Department, g.Key.Team))
            .OrderBy(x => x.BusinessUnit)
            .ThenBy(x => x.Department)
            .ThenBy(x => x.Team)
            .ToList();

        return Ok(rows);
    }

    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<UserMaintenanceDto>>> GetUsers(CancellationToken ct)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);
        var rows = employees
            .Select(x => new UserMaintenanceDto(x.Id, x.EmployeeNo, x.DisplayName, x.Email, x.Department, x.Team, x.PositionTitle, x.IsActive))
            .ToList();

        return Ok(rows);
    }

    [HttpGet("access-control")]
    public ActionResult<IReadOnlyList<RolePermissionDto>> GetAccessControl()
    {
        var rows = new List<RolePermissionDto>
        {
            new("Employee", true, false, false, false),
            new("Supervisor", true, true, false, false),
            new("Manager", true, true, true, false),
            new("HR", true, true, true, true),
            new("SystemAdministrator", true, true, true, true)
        };

        return Ok(rows);
    }

    [HttpGet("calendar")]
    public ActionResult<IReadOnlyList<SystemCalendarDto>> GetSystemCalendar()
    {
        var currentYear = DateTime.UtcNow.Year;
        var rows = new List<SystemCalendarDto>
        {
            new(new DateTime(currentYear, 1, 1), "Public Holiday", "New Year", true),
            new(new DateTime(currentYear, 12, 25), "Public Holiday", "Christmas", true),
            new(new DateTime(currentYear, 12, 31), "Shutdown Day", "Year-end maintenance", false)
        };

        return Ok(rows);
    }

    public sealed record OrganizationUnitDto(string BusinessUnit, string Department, string Team);

    public sealed record UserMaintenanceDto(
        Guid Id,
        string EmployeeNo,
        string DisplayName,
        string Email,
        string Department,
        string Team,
        string Position,
        bool IsActive);

    public sealed record RolePermissionDto(
        string Role,
        bool SubmitLeave,
        bool ApproveLeave,
        bool HrVerification,
        bool Administration);

    public sealed record SystemCalendarDto(DateTime Date, string Type, string Name, bool Recurring);
}

