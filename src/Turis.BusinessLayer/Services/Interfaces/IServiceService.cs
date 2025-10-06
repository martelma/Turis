using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Responses;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IServiceService : IService
{
	Task<Result<ServiceSummaryModel>> SummaryAsync();
	Task<Result<List<ServiceModel>>> SummaryDetailsProposalsAsync();
	Task<Result<List<ServiceModel>>> SummaryDetailsCheckedAsync();
	Task<Result<List<ServiceModel>>> SummaryDetailsToDoAsync();
	Task<Result<List<ServiceModel>>> SummaryDetailsDoneAsync();
	Task<Result<PaginatedList<ServiceModel>>> ListAsync(ServiceSearchParameters parameters);
	Task<Result<ServiceModel>> GetAsync(Guid serviceId);
	Task<Result<ServiceModel>> SaveAsync(ServiceRequest model);
	Task<Result> DeleteAsync(Guid serviceId);
	Task<Result> RemoveServiceRelationAsync(Guid sourceServiceId, Guid targetServiceId);
	Task<Result> AddServiceRelationAsync(Guid sourceServiceId, Guid targetServiceId);
	Task<Result<PaginatedList<ServiceModel>>> AccountStatement(AccountStatementParameters parameters);
	Task<Result<ServiceCheckDataInfo>> CheckDataInfoAsync(Guid serviceId);
	Service GetRandom();
	Task<Result<ContactSummaryModel>> ContactSummaryAsync(Guid contactId);
	Task<Result> NotifyProposalAsync(Guid serviceId);
	Task<Result> AcceptServiceAsync(Guid serviceId);
	Task<Result> RejectServiceAsync(Guid serviceId);
	Task<Result<LinkedServiceModel>> LinkedServicesAsync(Guid serviceId);
	Task<Result<List<ServiceEasyModel>>> ToBeBilledAsync(Guid clientId);
}