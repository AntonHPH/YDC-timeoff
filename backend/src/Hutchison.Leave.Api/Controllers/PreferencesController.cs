using Hutchison.Leave.Application;
using Hutchison.Leave.Api.Security;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/preferences")]
public sealed class PreferencesController : ControllerBase
{
    private readonly IUserPreferenceRepository _preferenceRepository;

    public PreferencesController(IUserPreferenceRepository preferenceRepository)
    {
        _preferenceRepository = preferenceRepository;
    }

    [HttpGet("languages")]
    public ActionResult<IReadOnlyList<string>> GetLanguages()
    {
        var roleCheck = this.RequireAnyRole("Employee", "Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        return Ok(new[] { "English", "Traditional Chinese", "Simplified Chinese" });
    }

    [HttpGet("defaults")]
    public async Task<ActionResult<UserPreferenceDto>> GetDefaults(CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Employee", "Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        var defaults = await _preferenceRepository.GetDefaultsAsync(ct);
        return Ok(defaults);
    }

    [HttpPost]
    public async Task<ActionResult> Save([FromBody] UserPreferenceDto preference, CancellationToken ct)
    {
        var roleCheck = this.RequireAnyRole("Employee", "Supervisor", "Manager", "HR", "SystemAdministrator");
        if (roleCheck is not null)
        {
            return roleCheck;
        }

        await _preferenceRepository.SaveDefaultsAsync(preference, ct);
        return Ok(new { message = "Preferences saved.", preference });
    }
}

