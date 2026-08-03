using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Security;

internal static class RoleAccess
{
    public const string RoleHeaderName = "X-App-Role";

    public static bool IsInAnyRole(HttpRequest request, params string[] allowedRoles)
    {
        var currentRole = ReadRole(request);
        if (string.IsNullOrWhiteSpace(currentRole))
        {
            return false;
        }

        return allowedRoles.Any(role => string.Equals(role, currentRole, StringComparison.OrdinalIgnoreCase));
    }

    public static string? ReadRole(HttpRequest request)
    {
        return request.Headers.TryGetValue(RoleHeaderName, out var values)
            ? values.ToString()
            : null;
    }
}

internal static class ControllerRoleGuardExtensions
{
    public static ActionResult? RequireAnyRole(this ControllerBase controller, params string[] allowedRoles)
    {
        if (RoleAccess.IsInAnyRole(controller.Request, allowedRoles))
        {
            return null;
        }

        return controller.StatusCode(StatusCodes.Status403Forbidden, new
        {
            message = "Access denied for the current role.",
            requiredRoles = allowedRoles,
            currentRole = RoleAccess.ReadRole(controller.Request) ?? "Unknown"
        });
    }
}

