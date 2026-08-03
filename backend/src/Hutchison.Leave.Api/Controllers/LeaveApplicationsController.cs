using Hutchison.Leave.Application;
using Hutchison.Leave.Api.Security;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/leave-applications")]
public sealed class LeaveApplicationsController : ControllerBase
{
    private readonly ILeaveApplicationService _service;
    private readonly ILeaveCalculationService _calculationService;

    public LeaveApplicationsController(ILeaveApplicationService service, ILeaveCalculationService calculationService)
    {
        _service = service;
        _calculationService = calculationService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LeaveApplicationDto>>> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LeaveApplicationDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<LeaveApplicationDto>> Create([FromBody] LeaveApplicationCreateRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Employee", "Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        try
        {
            var created = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<LeaveApplicationDto>> Update(Guid id, [FromBody] LeaveApplicationUpdateRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Employee", "Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        try
        {
            var updated = await _service.UpdateAsync(id, request, ct);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<LeaveCalculationResult>> Calculate([FromBody] LeaveCalculationRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _calculationService.CalculateAsync(request, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<ActionResult> Approve(Guid id, [FromBody] ApprovalActionRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        try
        {
            await _service.ApproveAsync(id, request, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult> Reject(Guid id, [FromBody] ApprovalActionRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        try
        {
            await _service.RejectAsync(id, request, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult> Cancel(Guid id, [FromBody] LeaveApplicationCancelRequest request, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Employee", "Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        try
        {
            await _service.CancelAsync(id, request, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}/audit")]
    public async Task<ActionResult<IReadOnlyList<LeaveApplicationAuditEntryDto>>> GetAudit(Guid id, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Employee", "Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        var rows = await _service.GetAuditAsync(id, ct);
        return Ok(rows);
    }
}

