using JeMa.Shared.AspNetCore;
using System.Security.Claims;
using System.Security.Principal;

namespace Turis.Authentication.Extensions;

public static class ClaimExtensions
{
    public static string GetClaim(this IPrincipal user, string claimType)
    {
        var value = ((ClaimsPrincipal)user).FindFirstValue(claimType);
        return value;
    }

    public static IEnumerable<string> GetClaims(this IPrincipal user, string claimType)
    {
        var value = ((ClaimsPrincipal)user).FindAll(claimType).Select(c => c.Value);
        return value;
    }

    private static Guid GetGuid(this IPrincipal user, string claimType)
    {
        var value = GetClaim(user, claimType);
        if (Guid.TryParse(value, out var userId))
        {
            return userId;
        }

        return Guid.Empty;
    }

    public static string GetFirstName(this IPrincipal user)
        => GetClaim(user, ClaimTypes.GivenName);

    public static string GetLastName(this IPrincipal user)
        => GetClaim(user, ClaimTypes.Surname);

    public static string GetEmail(this IPrincipal user)
        => GetClaim(user, ClaimTypes.Email);

    public static IEnumerable<string> GetRoles(this IPrincipal user)
        => GetClaims(user, ClaimTypes.Role);

    public static IEnumerable<string> GetScopes(this IPrincipal user)
        => GetClaims(user, ClaimNames.Scope);

    public static Guid GetId(this IPrincipal user)
        => GetGuid(user, ClaimTypes.NameIdentifier);
}
