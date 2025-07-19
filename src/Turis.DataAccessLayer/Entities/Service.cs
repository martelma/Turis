using Turis.Common.Enums;
using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class Service : BaseEntity
{
	public string Code { get; set; }
	public string Title { get; set; }
	public DateTimeOffset Date { get; set; }
	public ServiceType? ServiceType { get; set; }
	public DurationType? DurationType { get; set; }
	public string? Referent { get; set; }
	public string? ReferentPhone { get; set; }
	public string? Note { get; set; }
	public string? Languages { get; set; }
	public Guid UserId { get; set; }
	public DateTimeOffset CreationDate { get; set; }
	public ServiceStatus Status { get; set; }
	public DateTimeOffset? OptionExpiration { get; set; }
	public string Location { get; set; }
	public string? MeetingPlace { get; set; }
	public int? People { get; set; }
	public bool Checked { get; set; }
	public Guid? PriceListId { get; set; }
	public PriceList? PriceList { get; set; }
	public decimal? PriceCalculated { get; set; }
	public decimal? Price{ get; set; }
	public WorkflowCollaboratorStatus WorkflowCollaboratorStatus { get; set; }
	public Guid? CollaboratorId { get; set; }
	public Contact? Collaborator { get; set; }
	public Guid? ClientId { get; set; }
	public Contact? Client { get; set; }
	public string? CIGCode { get; set; }
	public string? CUPCode { get; set; }
	public bool? CashedIn { get; set; }
	public DateTimeOffset? CashedDate { get; set; }


	public decimal CommissionPercentage { get; set; }
	public decimal CommissionCalculated{ get; set; }
	public decimal Commission{ get; set; }
	public string? CommissionNote{ get; set; }
	public bool CommissionPaid { get; set; }
	public DateTimeOffset? CommissionPaymentDate { get; set; }
}