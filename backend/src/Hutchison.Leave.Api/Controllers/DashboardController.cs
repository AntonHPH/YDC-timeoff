using Hutchison.Leave.Application;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private static readonly Guid DefaultEmployeeId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary([FromQuery] Guid? employeeId, CancellationToken ct)
    {
        var summary = await _dashboardService.GetSummaryAsync(employeeId ?? DefaultEmployeeId, ct);
        return Ok(summary);
    }

    [HttpGet("worklist")]
    public async Task<ActionResult<IReadOnlyList<WorklistItemDto>>> GetWorklist([FromQuery] Guid? employeeId, CancellationToken ct)
    {
        var worklist = await _dashboardService.GetWorklistAsync(employeeId ?? DefaultEmployeeId, ct);
        return Ok(worklist);
    }
}

