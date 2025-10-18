using System.Linq.Dynamic.Core;
using System.Linq.Dynamic.Core.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Resources;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;

namespace Turis.BusinessLayer.Services;

public class ScopeGroupService(ApplicationDbContext dbContext, ILogger<ScopeGroupService> logger) : IScopeGroupService
{
	private readonly DbSet<ApplicationScopeGroup> context = dbContext.ApplicationScopeGroups;

	public async Task<Result<PaginatedList<ApplicationScopeGroupModel>>> ListAsync(bool includeScopes, int pageIndex,
		int itemsPerPage, string orderBy)
	{
		var query = dbContext.GetData<ApplicationScopeGroup>();

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

		var result = new PaginatedList<ApplicationScopeGroupModel>(data.Take(itemsPerPage), totalCount, pageIndex,itemsPerPage, data.Count > itemsPerPage);
		return result;
	}

	public async Task<Result<ApplicationScopeGroupModel>> GetAsync(Guid scopeGroupId, bool includeScopes)
	{
		var scopeGroup = await dbContext.GetData<ApplicationScopeGroup>()
			.Where(x => x.Id == scopeGroupId)
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

	public async Task<Result> SaveAsync(ApplicationScopeGroupRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new ApplicationScopeGroup
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.ApplicationId = Constants.ApplicationId;
		record.Name = model.Name;
		record.Description = model.Description;

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}
