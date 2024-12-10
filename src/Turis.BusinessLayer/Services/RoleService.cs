using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Exceptions;
using JeMa.Shared.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common;
using Turis.Common.Enums;
using Turis.Common.Models;
using Turis.DataAccessLayer;
using Turis.BusinessLayer.Resources;

namespace Turis.BusinessLayer.Services;

public class RoleService(IDbContext dbContext, ILogger<RoleService> logger, IIdentityService identityService) : IRoleService
{
    public async Task<Result<PaginatedList<ApplicationRoleModel>>> ListAsync(Guid userId, Guid applicationId, int pageIndex, int itemsPerPage, string orderBy)
    {
        var query = dbContext.GetData<ApplicationRole>()
            .Include(x => x.Scopes)
            .ThenInclude(x => x.Scope)
            .Where(r => r.ApplicationId == applicationId);

        // Hides the special Owner Role, only visible to those who are already owners and hidden for the others
        var user = (await identityService.GetUserAsync(userId)).Content;
        var workspaceApplication = user?.Applications?.FirstOrDefault(a => a.Name.EqualsIgnoreCase("WorkSpace"));
        if (workspaceApplication != null && workspaceApplication.Roles.Count(y => y.Name.EqualsIgnoreCase(RoleNames.Owner)) == 0)
            query = query.Where(r => !r.Name.Equals(RoleNames.Owner));

        var totalCount = await query.CountAsync();

        if (orderBy.HasValue())
        {
            try
            {
                query = query.OrderBy(orderBy);
            }
            catch (ParseException ex)
            {
                logger.LogError(ex, Errors.OrderByLoggerError, orderBy);
                return Result.Fail(FailureReasons.ClientError, string.Format(Errors.OrderByError, orderBy));
            }
        }

        // Prova a prendere un elemento in più di quelli richiesti per controllare se ci sono pagine successive.
        var data = await query
            .Skip(pageIndex * itemsPerPage).Take(itemsPerPage + 1)      
            .Select(r => new ApplicationRoleModel
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Scopes = r.Scopes.Select(s => new ApplicationScopeModel
				{
                    Id = s.Scope.Id,
                    Name = s.Scope.Name,
                    RoleIds = r.Scopes.Select(rs => rs.RoleId).ToList(),
                    ScopeGroupId = s.Scope.ScopeGroupId,
                    ApplicationId = s.Scope.ApplicationId
                }).ToList(),
                Users = r.UserRoles.Select(ur => new UserModel
				{
                    Id = ur.User.Id,
                    UserName = ur.User.UserName,
                    FirstName = ur.User.FirstName,
                    LastName = ur.User.LastName,
                    Email = ur.User.Email,
                    Language = ur.User.Language,
                    IsActive = ur.User.LockoutEnd.GetValueOrDefault(DateTimeOffset.MinValue) < DateTime.UtcNow,
                    AccountType = ur.User.PasswordHash != null ? AccountType.Local : AccountType.AzureActiveDirectory
                })
                .GroupBy(u => u.Id)
                .Select(u => u.First()),
            }).ToListAsync();

        var result = new PaginatedList<ApplicationRoleModel>(data.Take(itemsPerPage), totalCount, data.Count > itemsPerPage);
        return result;
    }

    public async Task<Result<ApplicationRoleModel>> GetAsync(Guid applicationId, Guid roleId)
    {
        var role = await dbContext.GetData<ApplicationRole>()
            .Include(x => x.Scopes)
            .ThenInclude(x => x.Scope)
            .Where(r => r.ApplicationId == applicationId && r.Id == roleId)
            .Select(r => ToModel(r)).FirstOrDefaultAsync();

        if (role is null)
            return Result.Fail(FailureReasons.ItemNotFound);

        return role;
    }

    public async Task<Result<ApplicationRoleModel>> GetAsync(Guid applicationId, string roleName)
    {
	    var role = await dbContext.GetData<ApplicationRole>()
		    .Include(x => x.Scopes)
		    .ThenInclude(x => x.Scope)
		    .Where(r => r.ApplicationId == applicationId && r.Name == roleName)
		    .Select(r => ToModel(r)).FirstOrDefaultAsync();

	    if (role is null)
		    return Result.Fail(FailureReasons.ItemNotFound);

	    return role;
    }

	private static ApplicationRoleModel ToModel(ApplicationRole r)
    {
	    return new ApplicationRoleModel
	    {
		    Id = r.Id,
		    Name = r.Name,
		    Description = r.Description,
		    Scopes = r.Scopes.Select(s => new ApplicationScopeModel
		    {
			    Id = s.Scope.Id,
			    Name = s.Scope.Name,
			    RoleIds = r.Scopes.Select(rs => rs.RoleId).ToList(),
			    ScopeGroupId = s.Scope.ScopeGroupId,
			    ApplicationId = s.Scope.ApplicationId
		    }).ToList(),
		    Users = r.UserRoles.Select(ur => new UserModel
			    {
				    Id = ur.User.Id,
				    UserName = ur.User.UserName,
				    FirstName = ur.User.FirstName,
				    LastName = ur.User.LastName,
				    Email = ur.User.Email,
				    Language = ur.User.Language,
				    IsActive = ur.User.LockoutEnd.GetValueOrDefault(DateTimeOffset.MinValue) < DateTime.UtcNow,
				    AccountType = ur.User.PasswordHash != null ? AccountType.Local : AccountType.AzureActiveDirectory
			    })
			    .GroupBy(u => u.Id)
			    .Select(u => u.First())
	    };
    }

    public async Task<Result<ApplicationRoleModel>> SaveAsync(Guid applicationId, ApplicationRoleModel role)
    {
        var dbRole = await dbContext.GetData<ApplicationRole>(true)
            .Include(x => x.Scopes)
            .ThenInclude(x => x.Scope)
            .FirstOrDefaultAsync(x => x.Id == role.Id);

        if (dbRole is null)
        {
            dbRole = new ApplicationRole();
            dbContext.Insert(dbRole);
        }

        dbRole.Id = role.Id != Guid.Empty ? role.Id : dbRole.Id;
        dbRole.ApplicationId = applicationId;
        dbRole.Name = role.Name;
        dbRole.Description = role.Description;
        dbRole.NormalizedName = role.Name.ToUpperInvariant();
        dbRole.ConcurrencyStamp = Guid.NewGuid().ToString();

        await SaveRoleScopesAsync(role, dbRole);

        await dbContext.SaveAsync();

        role.Id = dbRole.Id;
        return role;
    }

    private static Task SaveRoleScopesAsync(ApplicationRoleModel model, ApplicationRole record)
    {
        record.Scopes ??= [];
        model.Scopes ??= [];

        //DELETE: Delete from the list of records the items no longer present in the new list
        var newIds = model.Scopes.Select(x => x.Id);
        record.Scopes.RemoveAll(x => !newIds.Contains(x.ScopeId));

        //ADD-UPDATE
        foreach (var scopeModel in model.Scopes)
        {
            var roleScope = record.Scopes.FirstOrDefault(x => x.ScopeId == scopeModel.Id);
            if (roleScope == null)
            {
                roleScope = new ApplicationRoleScope
                {
                    ScopeId = scopeModel.Id,
                    RoleId = record.Id,
                };
                record.Scopes.Add(roleScope);
            }
        }

        return Task.CompletedTask;
    }

    public async Task<Result> DeleteAsync(Guid applicationId, Guid roleId)
    {
        // Controlla se il ruolo è associato a qualche utente o scope.
        var roleInUse = await dbContext.GetData<ApplicationUserRole>().AnyAsync(r => r.RoleId == roleId)
            || await dbContext.GetData<ApplicationScope>().AnyAsync(s => s.Roles.Any(rs => rs.RoleId == roleId));

        if (roleInUse)
        {
            return Result.Fail(FailureReasons.ClientError, Errors.UnableToDelete, Errors.RoleInUse);
        }

        var deleteRows = await dbContext.GetData<ApplicationRole>()
            .Where(r => r.ApplicationId == applicationId && r.Id == roleId).ExecuteDeleteAsync();

        if (deleteRows == 0)
        {
            return Result.Fail(FailureReasons.ItemNotFound);
        }

        return Result.Ok();
    }
}
