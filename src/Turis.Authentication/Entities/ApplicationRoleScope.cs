namespace Turis.Authentication.Entities;

public class ApplicationRoleScope
{
    public Guid RoleId { get; set; }
    public ApplicationRole Role { get; set; }

    public Guid ScopeId { get; set; }
    public ApplicationScope Scope { get; set; }
}
