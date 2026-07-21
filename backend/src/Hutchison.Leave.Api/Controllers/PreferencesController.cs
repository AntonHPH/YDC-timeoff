using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/preferences")]
public sealed class PreferencesController : ControllerBase
{
    [HttpGet("languages")]
    public ActionResult<IReadOnlyList<string>> GetLanguages()
    {
        return Ok(new[] { "English", "Traditional Chinese", "Simplified Chinese" });
    }

    [HttpGet("defaults")]
    public ActionResult<UserPreferenceDto> GetDefaults()
    {
        return Ok(new UserPreferenceDto("English", "light", true, "month", true));
    }

    [HttpPost]
    public ActionResult Save([FromBody] UserPreferenceDto preference)
    {
        return Ok(new { message = "Preferences saved.", preference });
    }

    public sealed record UserPreferenceDto(
        string Language,
        string Theme,
        bool NotificationEnabled,
        string DefaultCalendarView,
        bool DashboardPersonalizationEnabled);
}

