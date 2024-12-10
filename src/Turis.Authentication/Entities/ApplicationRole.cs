using Microsoft.AspNetCore.Identity;

namespace Turis.Authentication.Entities;

public class ApplicationRole : IdentityRole<Guid>
{
    public Guid ApplicationId { get; set; }

    public string Description { get; set; }

    public virtual Application Application { get; set; }

    public ApplicationRole()
    {
    }

    public ApplicationRole(string roleName) : base(roleName)
    {
    }

    public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }

    public virtual ICollection<ApplicationRoleScope> Scopes { get; set; }
}

