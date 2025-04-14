using Microsoft.AspNetCore.Identity;
using Turis.Authentication.Resources;
using Turis.Common.Models.Requests;

namespace Turis.Authentication.Validators;

public class ApplicationRoleValidator : RoleValidator<ApplicationRoleRequest>
{
    public override async Task<IdentityResult> ValidateAsync(RoleManager<ApplicationRoleRequest> manager, ApplicationRoleRequest role)
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

        //var owner = await manager.Roles.FirstOrDefaultAsync(x => x.ApplicationId == role.ApplicationId && x.NormalizedName == roleName);
        //if (owner is not null && !string.Equals(manager.GetRoleIdAsync(owner), manager.GetRoleIdAsync(role)))
        //{
	       // return IdentityResult.Failed(new IdentityError
	       // {
		      //  Code = "DuplicateRoleName",
		      //  Description = IdentityMessages.DuplicateRoleName
	       // });
        //}

        return IdentityResult.Success;
    }
}
