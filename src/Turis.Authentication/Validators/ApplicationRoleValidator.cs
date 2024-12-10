using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Turis.Authentication.Entities;
using Turis.Authentication.Resources;

namespace Turis.Authentication.Validators;

public class ApplicationRoleValidator : RoleValidator<ApplicationRole>
{
    public override async Task<IdentityResult> ValidateAsync(RoleManager<ApplicationRole> manager, ApplicationRole role)
    {
        var roleName = await manager.GetRoleNameAsync(role);
        if (string.IsNullOrWhiteSpace(roleName))
        {
            return IdentityResult.Failed(new IdentityError
            {
                Code = "RoleNameIsNotValid",
                Description = IdentityMessages.InvalidRoleName
            });
        }
        else
        {
            var owner = await manager.Roles.FirstOrDefaultAsync(x => x.ApplicationId == role.ApplicationId && x.NormalizedName == roleName);
            if (owner is not null && !string.Equals(manager.GetRoleIdAsync(owner), manager.GetRoleIdAsync(role)))
            {
                return IdentityResult.Failed(new IdentityError
                {
                    Code = "DuplicateRoleName",
                    Description = IdentityMessages.DuplicateRoleName
                });
            }
        }

        return IdentityResult.Success;
    }
}
