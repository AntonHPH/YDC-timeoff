using Hutchison.Leave.Application;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/search")]
public sealed class SmartSearchController : ControllerBase
{
    private readonly ISmartSearchService _smartSearchService;

    public SmartSearchController(ISmartSearchService smartSearchService)
    {
        _smartSearchService = smartSearchService;
    }

    [HttpGet]
    public async Task<ActionResult<SmartSearchResponseDto>> Search([FromQuery] string query, [FromQuery] int limit = 10, CancellationToken ct = default)
    {
        var result = await _smartSearchService.SearchAsync(query, limit, ct);
        return Ok(result);
    }
}

