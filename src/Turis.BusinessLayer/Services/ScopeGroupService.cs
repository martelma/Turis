using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer;
using Turis.BusinessLayer.Resources;

namespace Turis.BusinessLayer.Services;

public class ScopeGroupService(IDbContext dbContext, ILogger<ScopeGroupService> logger) : IScopeGroupService
{
    public async Task<Result<PaginatedList<ApplicationScopeGroupModel>>> ListAsync(Guid applicationId, bool includeScopes, int pageIndex, int itemsPerPage, string orderBy)
    {
        var query = dbContext.GetData<ApplicationScopeGroup>().Where(r => r.ApplicationId == applicationId);

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

        var data = await query
            .Skip(pageIndex * itemsPerPage).Take(itemsPerPage + 1)      // Prova a prendere un elemento in più di quelli richiesti per controllare se ci sono pagine successive.
            .Select(s => new ApplicationScopeGroupModel
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Scopes = includeScopes ? s.Scopes.Select(r => new ApplicationScopeModel
				{
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    RoleIds = r.Roles.Select(rs => rs.RoleId).ToList(),
                    ApplicationId = r.ApplicationId
                }) : null,
            }).ToListAsync();

        var result = new PaginatedList<ApplicationScopeGroupModel>(data.Take(itemsPerPage), totalCount, data.Count > itemsPerPage);
        return result;
    }

    public async Task<Result<ApplicationScopeGroupModel>> GetAsync(Guid applicationId, Guid scopeGroupId, bool includeScopes)
    {
        var scopeGroup = await dbContext.GetData<ApplicationScopeGroup>()
            .Where(s => s.ApplicationId == applicationId && s.Id == scopeGroupId)
            .Select(s => new ApplicationScopeGroupModel
			{
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Scopes = includeScopes ? s.Scopes.Select(r => new ApplicationScopeModel
				{
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    RoleIds = r.Roles.Select(rs => rs.RoleId).ToList(),
                    ApplicationId = r.ApplicationId
                }) : null
            }).FirstOrDefaultAsync();

        if (scopeGroup is null)
        {
            return Result.Fail(FailureReasons.ItemNotFound);
        }

        return scopeGroup;
    }

    public async Task<Result<ApplicationScopeGroupModel>> SaveAsync(Guid applicationId, ApplicationScopeGroupModel scopeGroup)
    {
        var dbScopeGroup = await dbContext.GetAsync<ApplicationScopeGroup>(scopeGroup.Id);

        if (dbScopeGroup is null)
        {
            dbScopeGroup = new ApplicationScopeGroup();
            dbContext.Insert(dbScopeGroup);
        }

        dbScopeGroup.Id = scopeGroup.Id;
        dbScopeGroup.ApplicationId = applicationId;
        dbScopeGroup.Name = scopeGroup.Name;
        dbScopeGroup.Description = scopeGroup.Description;

        await dbContext.SaveAsync();

        scopeGroup.Id = dbScopeGroup.Id;
        return scopeGroup;
    }

    public async Task<Result> DeleteAsync(Guid applicationId, Guid scopeGroupId)
    {
        // Controlla se lo ScopeGroup contiene almeno uno scope.
        var scopeGroupInUse = await dbContext.GetData<ApplicationScope>().AnyAsync(s => s.ScopeGroupId == scopeGroupId);

        if (scopeGroupInUse)
        {
            return Result.Fail(FailureReasons.ClientError, Errors.UnableToDelete, Errors.ScopeGroupInUse);
        }

        var deleteRows = await dbContext.GetData<ApplicationScopeGroup>()
            .Where(r => r.ApplicationId == applicationId && r.Id == scopeGroupId).ExecuteDeleteAsync();

        if (deleteRows == 0)
        {
            return Result.Fail(FailureReasons.ItemNotFound);
        }

        return Result.Ok();
    }
}
