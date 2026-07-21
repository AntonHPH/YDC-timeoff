using Hutchison.Leave.Application;
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
}

