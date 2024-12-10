using Microsoft.AspNetCore.Authorization;

namespace Turis.Common.ScopePermission;

public class PermissionAttribute : AuthorizeAttribute
{
    public PermissionAttribute(params string[] permissions) : base(string.Join(',', permissions))
    {
    }
}