using OperationResults;
using Turis.BusinessLayer.Parameters;
using Turis.BusinessLayer.Services.Base;
using Turis.Common.Models;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IContactService : IService
{
	Task<Result<TeamSummaryModel>> TeamSummaryAsync(TeamSummaryParameters parameters);
	Task<Result<PaginatedList<ContactModel>>> ListAsync(ContactSearchParameters parameters);
	Task<Result<ContactModel>> GetAsync(Guid serviceId);
	Task<Result<ContactModel>> SaveAsync(ContactRequest model);
	Task<Result> DeleteAsync(Guid id);
	Task<Result<IEnumerable<ContactModel>>> FilterClients(string pattern);
	Task<Result<IEnumerable<ContactModel>>> FilterCollaborators(string pattern);
	Task<Result<IEnumerable<ContactModel>>> CollaboratorsWithMonitor(CollaboratorSearchParameters parameters);
	Task<Result<List<ClientBillingSummaryModel>>> UnbilledSummaryAsync();
}