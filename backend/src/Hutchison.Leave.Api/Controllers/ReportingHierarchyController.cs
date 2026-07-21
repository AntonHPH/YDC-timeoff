using Hutchison.Leave.Application;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/reporting-hierarchy")]
public sealed class ReportingHierarchyController : ControllerBase
{
    private readonly IReportingHierarchyService _service;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IReportingRepository _reportingRepository;

    public ReportingHierarchyController(
        IReportingHierarchyService service,
        IEmployeeRepository employeeRepository,
        IReportingRepository reportingRepository)
    {
        _service = service;
        _employeeRepository = employeeRepository;
        _reportingRepository = reportingRepository;
    }

    [HttpGet("tree")]
    public async Task<ActionResult<IReadOnlyList<HierarchyNodeDto>>> GetTree(CancellationToken ct)
    {
        var result = await _service.GetTreeAsync(ct);
        return Ok(result);
    }

    [HttpGet("table")]
    public async Task<ActionResult<IReadOnlyList<HierarchyTableRowDto>>> GetTable(CancellationToken ct)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);
        var relations = await _reportingRepository.GetAllAsync(ct);

        var employeeMap = employees.ToDictionary(x => x.Id, x => x.DisplayName);
        var rows = relations
            .Select(r => new HierarchyTableRowDto(
                employeeMap.TryGetValue(r.ManagerId, out var manager) ? manager : "Unknown",
                employeeMap.TryGetValue(r.EmployeeId, out var employee) ? employee : "Unknown",
                r.Sequence))
            .ToList();

        return Ok(rows);
    }

    [HttpPost("validate")]
    public async Task<ActionResult<HierarchyValidationResult>> Validate(CancellationToken ct)
    {
        var result = await _service.ValidateAsync(ct);
        return Ok(result);
    }

    public sealed record HierarchyTableRowDto(string ManagerName, string EmployeeName, int Sequence);
}

