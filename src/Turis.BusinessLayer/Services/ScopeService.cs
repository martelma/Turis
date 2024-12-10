using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Exceptions;
using JeMa.Shared.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.DataAccessLayer;
using Turis.BusinessLayer.Resources;

namespace Turis.BusinessLayer.Services;

public class ScopeService(IDbContext dbContext, ILogger<ScopeService> logger) : IScopeService
{
    public async Task<Result<PaginatedList<ApplicationScopeModel>>> ListAsync(Guid applicationId, Guid? roleId, int pageIndex, int itemsPerPage, string orderBy)
    {
        var query = dbContext.GetData<ApplicationScope>().Where(s => s.ApplicationId == applicationId);

        var totalCount = await query.CountAsync();

        if (orderBy != null && orderBy.Trim().Length > 0)
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
            .Select(s => new ApplicationScopeModel
			{
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                RoleIds = s.Roles.Select(r => r.RoleId).ToList(),
                ScopeGroupId = s.ScopeGroupId,
                ScopeGroupName = s.ScopeGroup != null ? s.ScopeGroup.Name.ToString() : "No Group",
                ApplicationId = s.ApplicationId
            }).ToListAsync();

        var result = new PaginatedList<ApplicationScopeModel>(data.Take(itemsPerPage), totalCount, data.Count > itemsPerPage);
        return result;
    }

    public async Task<Result<ApplicationScopeModel>> GetAsync(Guid applicationId, Guid scopeId)
    {
        var scope = await dbContext.GetData<ApplicationScope>()
            .Where(s => s.ApplicationId == applicationId && s.Id == scopeId)
            .Select(s => new ApplicationScopeModel()
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                RoleIds = s.Roles.Select(r => r.RoleId).ToList(),
                ApplicationId = s.ApplicationId,
                ScopeGroupId = s.ScopeGroupId,
            }).FirstOrDefaultAsync();

        if (scope is null)
        {
            return Result.Fail(FailureReasons.ItemNotFound);
        }

        return scope;
    }

    public async Task<Result<ApplicationScopeModel>> SaveAsync(Guid applicationId, ApplicationScopeModel scope)
    {
        var dbScope = await dbContext.GetAsync<ApplicationScope>(scope.Id);

        if (dbScope is null)
        {
            dbScope = new ApplicationScope();
            dbContext.Insert(dbScope);
        }

        dbScope.Id = scope.Id;
        dbScope.ApplicationId = applicationId;
        dbScope.Name = scope.Name;
        dbScope.Description = scope.Description;
        dbScope.ScopeGroupId = scope.ScopeGroupId;

        await SaveScopeRolesAsync(scope, dbScope);

        await dbContext.SaveAsync();

        scope.Id = dbScope.Id;
        return scope;
    }

    private static Task SaveScopeRolesAsync(ApplicationScopeModel model, ApplicationScope record)
    {
        record.Roles ??= [];
        model.RoleIds ??= [];

        //DELETE: Delete from the list of records the items no longer present in the new list
        var newIds = model.RoleIds;
        record.Roles.RemoveAll(x => !newIds.Contains(x.RoleId));

        //ADD-UPDATE
        foreach (var roleModelId in model.RoleIds)
        {
            var roleScope = record.Roles.FirstOrDefault(x => x.RoleId == roleModelId);
            if (roleScope == null)
            {
                roleScope = new ApplicationRoleScope
                {
                    ScopeId = record.Id,
                    RoleId = roleModelId,
                };
                record.Roles.Add(roleScope);
            }
        }

        return Task.CompletedTask;
    }

    public async Task<Result> DeleteAsync(Guid applicationId, Guid scopeId)
    {
        var deleteRows = await dbContext.GetData<ApplicationScopeModel>()
            .Where(r => r.ApplicationId == applicationId && r.Id == scopeId).ExecuteDeleteAsync();

        if (deleteRows == 0)
        {
            return Result.Fail(FailureReasons.ItemNotFound);
        }

        return Result.Ok();
    }
}
