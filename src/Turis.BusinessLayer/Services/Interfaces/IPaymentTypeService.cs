using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IPaymentTypeService : IService
{
	Task<Result<PaymentTypeModel>> GetAsync(Guid id);
	Task<Result<PaginatedList<PaymentTypeModel>>> ListAsync(PaymentTypeSearchParameters parameters);
	Task<Result> SaveAsync(PaymentTypeRequest model);
	Task<Result> DeleteAsync(Guid id);
}