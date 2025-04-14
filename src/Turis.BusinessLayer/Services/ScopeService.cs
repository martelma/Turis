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
using Microsoft.Extensions.Options;
using TinyHelpers.Extensions;
using Turis.Authentication.Settings;
using Turis.BusinessLayer.Extensions;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services;

public class ScopeService(IDbContext dbContext,
	ILogger<ScopeService> logger,
	IOptions<AuthenticationSettings> authenticationSettingsOptions) : IScopeService
{
	private readonly AuthenticationSettings authenticationSettings = authenticationSettingsOptions.Value;

	public async Task<Result<PaginatedList<ApplicationScopeModel>>> ListAsync(Guid? roleId, int pageIndex, int itemsPerPage, string orderBy)
	{
		var query = dbContext.GetData<ApplicationScope>()
			.Include(x => x.ScopeGroup)
			.Include(x => x.Roles)
			.Where(s => s.ApplicationId == authenticationSettings.ApplicationId)
			.OrderBy(x => x.Name);

		var totalCount = await query.CountAsync();

		if (orderBy != null && orderBy.Trim().Length > 0)
		{
			try
			{
				if (orderBy.EqualsIgnoreCase("Name"))
					query = query.OrderBy(x => x.Name);
			}
			catch (ParseException ex)
			{
				logger.LogError(ex, Errors.OrderByLoggerError, orderBy);
				return Result.Fail(FailureReasons.ClientError, string.Format(Errors.OrderByError, orderBy));
			}
		}

		var data = query
			.Skip(pageIndex * itemsPerPage).Take(itemsPerPage + 1)      // Prova a prendere un elemento in più di quelli richiesti per controllare se ci sono pagine successive.
			.ToModel()
			.ToList();

		var result = new PaginatedList<ApplicationScopeModel>(data.Take(itemsPerPage), totalCount, data.Count > itemsPerPage);
		return result;
	}

	public async Task<Result<ApplicationScopeModel>> GetAsync(Guid scopeId)
	{
		var scope = await dbContext.GetData<ApplicationScope>()
			.Include(x => x.ScopeGroup)
			.Include(x => x.Roles)
			.Where(s => s.ApplicationId == authenticationSettings.ApplicationId && s.Id == scopeId)
			.FirstOrDefaultAsync();

		if (scope is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		return scope.ToModel();
	}

	public async Task<Result<ApplicationScopeModel>> SaveAsync(ApplicationScopeRequest request)
	{
		var dbScope = await dbContext.GetAsync<ApplicationScope>(request.Id);

		if (dbScope is null)
		{
			dbScope = new ApplicationScope
			{
				Id = Guid.NewGuid()
			};
			dbContext.Insert(dbScope);
		}

		//dbScope.Id = request.Id;
		dbScope.ApplicationId = authenticationSettings.ApplicationId;
		dbScope.Name = request.Name;
		dbScope.Description = request.Description;
		if (request.ScopeGroupId.HasValue())
			dbScope.ScopeGroupId = request.ScopeGroupId.Value;

		await dbContext.SaveAsync();

		request.Id = dbScope.Id;
		return dbScope.ToModel();
	}

	public async Task<Result> DeleteAsync(Guid scopeId)
	{
		var deleteRows = await dbContext.GetData<ApplicationScope>()
			.Where(r => r.ApplicationId == authenticationSettings.ApplicationId && r.Id == scopeId).ExecuteDeleteAsync();

		if (deleteRows == 0)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		return Result.Ok();
	}
}
