using Microsoft.AspNetCore.Authorization;

namespace Turis.Common.ScopePermission;

public class PermissionRequirement : IAuthorizationRequirement
{
    public IEnumerable<string> Permissions { get; set; }

    public PermissionRequirement(string permissions)
    {
        Permissions = permissions.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}