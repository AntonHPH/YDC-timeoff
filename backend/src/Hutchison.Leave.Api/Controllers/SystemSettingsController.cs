using Hutchison.Leave.Application;
using Hutchison.Leave.Api.Security;
using Hutchison.Leave.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/system-settings")]
public sealed class SystemSettingsController : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles =
    [
        "Employee",
        "Supervisor",
        "Manager",
        "HR",
        "SystemAdministrator"
    ];

    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUserRoleRepository _userRoleRepository;

    public SystemSettingsController(IEmployeeRepository employeeRepository, IUserRoleRepository userRoleRepository)
    {
        _employeeRepository = employeeRepository;
        _userRoleRepository = userRoleRepository;
    }

    [HttpGet("organization-units")]
    public async Task<ActionResult<IReadOnlyList<OrganizationUnitDto>>> GetOrganizationUnits(CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

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
        var roleCheck = this.RequireAnyRole("HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        var employees = await _employeeRepository.GetAllAsync(ct);
        var roles = await _userRoleRepository.GetAllAsync(ct);

        var rows = employees
            .Select(x => new UserMaintenanceDto(
                x.Id,
                x.EmployeeNo,
                x.DisplayName,
                x.Email,
                x.Department,
                x.Team,
                x.PositionTitle,
                x.IsActive,
                roles.TryGetValue(x.Id, out var role) ? role : "Employee"))
            .ToList();

        return Ok(rows);
    }

    [HttpPost("users")]
    public async Task<ActionResult<UserMaintenanceDto>> CreateUser([FromBody] CreateUserRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        if (string.IsNullOrWhiteSpace(request.DisplayName) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Display name and email are required." });
        }

        var employees = await _employeeRepository.GetAllAsync(ct);
        var duplicated = employees.Any(x => x.Email.Equals(request.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (duplicated)
        {
            return BadRequest(new { message = "A user with this email already exists." });
        }

        var created = new Employee
        {
            EmployeeNo = string.IsNullOrWhiteSpace(request.EmployeeNo)
                ? $"E{DateTime.UtcNow:HHmmss}"
                : request.EmployeeNo.Trim(),
            DisplayName = request.DisplayName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PositionTitle = string.IsNullOrWhiteSpace(request.Position) ? "Staff" : request.Position.Trim(),
            BusinessUnit = string.IsNullOrWhiteSpace(request.BusinessUnit) ? "Hong Kong Terminal" : request.BusinessUnit.Trim(),
            Department = string.IsNullOrWhiteSpace(request.Department) ? "General" : request.Department.Trim(),
            Team = string.IsNullOrWhiteSpace(request.Team) ? "General" : request.Team.Trim(),
            IsActive = true
        };

        await _employeeRepository.AddAsync(created, ct);

        var normalizedRole = NormalizeRole(request.Role);
        await _userRoleRepository.SetRoleAsync(created.Id, normalizedRole, ct);

        var row = new UserMaintenanceDto(
            created.Id,
            created.EmployeeNo,
            created.DisplayName,
            created.Email,
            created.Department,
            created.Team,
            created.PositionTitle,
            created.IsActive,
            normalizedRole);

        return Ok(row);
    }

    [HttpPut("users/{id:guid}/status")]
    public async Task<ActionResult<UserMaintenanceDto>> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee is null)
        {
            return NotFound(new { message = "User not found." });
        }

        employee.IsActive = request.IsActive;
        await _employeeRepository.UpdateAsync(employee, ct);

        var role = await _userRoleRepository.GetByEmployeeIdAsync(id, ct) ?? "Employee";
        return Ok(new UserMaintenanceDto(
            employee.Id,
            employee.EmployeeNo,
            employee.DisplayName,
            employee.Email,
            employee.Department,
            employee.Team,
            employee.PositionTitle,
            employee.IsActive,
            role));
    }

    [HttpPut("users/{id:guid}/role")]
    public async Task<ActionResult<UserMaintenanceDto>> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee is null)
        {
            return NotFound(new { message = "User not found." });
        }

        var normalizedRole = NormalizeRole(request.Role);
        await _userRoleRepository.SetRoleAsync(id, normalizedRole, ct);

        return Ok(new UserMaintenanceDto(
            employee.Id,
            employee.EmployeeNo,
            employee.DisplayName,
            employee.Email,
            employee.Department,
            employee.Team,
            employee.PositionTitle,
            employee.IsActive,
            normalizedRole));
    }

    [HttpGet("access-control")]
    public ActionResult<IReadOnlyList<RolePermissionDto>> GetAccessControl()
    {
        var roleCheck = this.RequireAnyRole("HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

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
        var roleCheck = this.RequireAnyRole("HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

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
        bool IsActive,
        string Role);

    public sealed record CreateUserRequest(
        string? EmployeeNo,
        string DisplayName,
        string Email,
        string Department,
        string Team,
        string Position,
        string? BusinessUnit,
        string? Role);

    public sealed record UpdateUserStatusRequest(bool IsActive);

    public sealed record UpdateUserRoleRequest(string Role);

    public sealed record RolePermissionDto(
        string Role,
        bool SubmitLeave,
        bool ApproveLeave,
        bool HrVerification,
        bool Administration);

    public sealed record SystemCalendarDto(DateTime Date, string Type, string Name, bool Recurring);

    private static string NormalizeRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return "Employee";
        }

        var cleaned = role.Trim();
        return AllowedRoles.FirstOrDefault(x => x.Equals(cleaned, StringComparison.OrdinalIgnoreCase)) ?? "Employee";
    }
}

