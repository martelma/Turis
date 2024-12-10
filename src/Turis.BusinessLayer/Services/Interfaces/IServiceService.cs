using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IServiceService : IService
{
	Task<Result<PaginatedList<ServiceModel>>> ListAsync(ServiceSearchParameters parameters);
	Task<Result<ServiceModel>> GetAsync(Guid serviceId);
	Task<Result<ServiceModel>> SaveAsync(ServiceRequest model);
	Task<Result> DeleteAsync(Guid serviceId);
}