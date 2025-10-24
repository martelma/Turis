using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IPaymentService : IService
{
	Task<Result<PaymentModel>> GetAsync(Guid id);
	Task<Result<PaginatedList<PaymentModel>>> ListAsync(PaymentSearchParameters parameters);
	Task<Result> SaveAsync(PaymentRequest model);
	Task<Result> DeleteAsync(Guid id);
}