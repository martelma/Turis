using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Parameters.Base;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Enums;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class PriceListService(ApplicationDbContext dbContext
	, IUserService userService
	, ILogger<PriceListService> logger) : IPriceListService
{
	private readonly DbSet<PriceList> context = dbContext.PriceLists;

	public async Task<Result<PriceListModel>> GetAsync(Guid id)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel();
	}

	public async Task<Result<PriceListModel>> GetAsync(string code)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Code == code);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel();
	}

	public async Task<Result<PaginatedList<PriceListModel>>> ListAsync(PriceListSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = context.AsNoTracking();

		// Filter by search pattern
		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
			{
				query = query.Where(x =>
					(x.Code != null && x.Code.Contains(itemPattern))
					|| (x.Name != null && x.Name.Contains(itemPattern)));
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			switch (parameters.OrderBy)
			{
				case $"{nameof(PriceList.Name)}Asc":
				{
					query = query.OrderBy(x => x.Name);
					break;
				}
				case $"{nameof(PriceList.Name)}Desc":
				{
					query = query.OrderByDescending(x => x.Name);
					break;
				}
			}
		}
		else
			query = query.OrderBy(x => x.Name);

		var list = await query
			.Skip(paginator.PageIndex * paginator.PageSize)
			.Take(paginator.PageSize)
			.Select(x => x.ToModel())
			.ToListAsync();

		var result = new PaginatedList<PriceListModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

		return await Task.FromResult(result);
	}

	public async Task<Result> SaveAsync(PriceListRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new PriceList
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.Code = model.Code;
		record.Name = model.Name;
		record.ServiceType = (ServiceType)Enum.Parse(typeof(ServiceType), model.ServiceType);
		record.DurationType = (DurationType)Enum.Parse(typeof(DurationType), model.DurationType);
		record.MaxCount = model.MaxCount;
		record.Price = model.Price;
		record.PriceExtra = model.PriceExtra;

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}