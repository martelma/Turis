using JeMa.Shared.Parameters.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OperationResults;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models;
using Turis.Common.Models.Requests;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services;

public class PaymentTypeService(ApplicationDbContext dbContext, ILogger<PaymentTypeService> logger) : IPaymentTypeService
{
	private readonly DbSet<PaymentType> context = dbContext.PaymentTypes;

	public async Task<Result<PaymentTypeModel>> GetAsync(Guid id)
	{
		var record = await context.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Id == id);

		if (record is null)
			return Result.Fail(FailureReasons.ItemNotFound);

		return record.ToModel();
	}

	public async Task<Result<PaginatedList<PaymentTypeModel>>> ListAsync(PaymentTypeSearchParameters parameters)
	{
		var paginator = new Paginator(parameters);

		var query = context.AsNoTracking();

		// Filter by search pattern
		if (parameters.Pattern.HasValue())
			foreach (var itemPattern in parameters.Pattern.Split(' '))
			{
				query = query.Where(x =>
					x.Name != null && x.Name.Contains(itemPattern)
					//|| x.Note != null && x.Note.Contains(itemPattern)
				);
			}

		var totalCount = await query.CountAsync();

		if (parameters.OrderBy.HasValue())
		{
			switch (parameters.OrderBy)
			{
				case $"{nameof(PaymentType.Name)}Asc":
					{
						query = query.OrderBy(x => x.Name);
						break;
					}
				case $"{nameof(PaymentType.Name)}Desc":
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

		var result = new PaginatedList<PaymentTypeModel>(list, totalCount, paginator.PageIndex, paginator.PageSize);

		return await Task.FromResult(result);
	}

	public async Task<Result> SaveAsync(PaymentTypeRequest model)
	{
		var record = model.Id != Guid.Empty ? await context.FindAsync(model.Id) : null;
		if (record == null)
		{
			record = new PaymentType
			{
				Id = Guid.NewGuid()
			};
			await context.AddAsync(record);
		}

		record.Code = model.Code;
		record.Name = model.Name;
		record.Note = model.Note;
		record.SdiCode = model.SdiCode;
		record.SdiName = model.SdiName;

		await dbContext.SaveChangesAsync();
		return Result.Ok();
	}

	public async Task<Result> DeleteAsync(Guid id)
	{
		await context.Where(x => x.Id == id).ExecuteDeleteAsync();
		return Result.Ok();
	}
}