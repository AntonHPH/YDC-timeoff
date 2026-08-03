using Hutchison.Leave.Application;
using Hutchison.Leave.Api.Security;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/admin")]
public sealed class AdminController : ControllerBase
{
    private readonly IDataStoreAdminRepository _adminRepository;

    public AdminController(IDataStoreAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    [HttpPost("reseed")]
    public async Task<ActionResult> Reseed(CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        await _adminRepository.ResetToSeedAsync(ct);
        return Ok(new { message = "Database reset completed with the expanded sample dataset." });
    }

    [HttpPost("clear")]
    public async Task<ActionResult> Clear(CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        await _adminRepository.ClearAllAsync(ct);
        return Ok(new { message = "Database cleared." });
    }
}

