using Hutchison.Leave.Application;
using Hutchison.Leave.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/leave-types")]
public sealed class LeaveTypesController : ControllerBase
{
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public LeaveTypesController(ILeaveTypeRepository leaveTypeRepository)
    {
        _leaveTypeRepository = leaveTypeRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LeaveType>>> GetAll(CancellationToken ct)
    {
        var data = await _leaveTypeRepository.GetAllAsync(ct);
        return Ok(data);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] LeaveType leaveType, CancellationToken ct)
    {
        if (id != leaveType.Id)
        {
            return BadRequest(new { message = "Id mismatch." });
        }

        await _leaveTypeRepository.UpdateAsync(leaveType, ct);
        return NoContent();
    }
}

