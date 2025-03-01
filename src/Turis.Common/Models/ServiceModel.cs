using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class ServiceModel : BaseModel
{
	public string Code { get; set; }
	public string Title { get; set; }
	public DateTimeOffset Date { get; set; }
	public string DateText { get; set; }
	public DateTime Start => Date.Date.AddHours(8);
	public DateTime End => Date.Date.AddHours(20);
	public string ServiceType { get; set; }
	public string DurationType { get; set; }
	public string Referent { get; set; }
	public string ReferentPhone { get; set; }
	public string Note { get; set; }
	public string[] Languages { get; set; }
	public Guid UserId { get; set; }
	public DateTimeOffset CreationDate { get; set; }
	public string Status { get; set; }
	public string WorkflowCollaboratorStatus { get; set; }
	public DateTimeOffset? OptionExpiration { get; set; }
	public string OptionExpirationText { get; set; }
	public string Location { get; set; }
	public string MeetingPlace { get; set; }
	public int People { get; set; }
	public bool Checked { get; set; }
	public Guid? PriceListId { get; set; }
	public PriceListModel PriceList { get; set; }
	public decimal PriceCalculated { get; set; }
	public decimal Price { get; set; }
	public Guid? ClientId { get; set; }
	public ContactModel Client { get; set; }
	public Guid? CollaboratorId { get; set; }
	public ContactModel Collaborator { get; set; }
	public string CIGCode { get; set; }
	public string CUPCode { get; set; }
	public bool CashedIn { get; set; }
	public DateTimeOffset CashedDate { get; set; }

	public decimal CommissionPercentage { get; set; }
	public decimal CommissionCalculated { get; set; }
	public decimal Commission { get; set; }
	public string CommissionNote { get; set; }
	public bool CommissionPaid { get; set; }
	public DateTimeOffset? CommissionPaymentDate { get; set; }
	public string BookmarkId { get; set; }
	public int AttachmentsCount { get; set; }

	public List<TagModel> Tags { get; set; } = [];

	public string BillingStatus
	{
		get
		{
			if (CashedIn)
				return "CashedIn";

			//TODO: check if the service is invoiced

			return string.Empty;
		}
	}

	public string CommissionStatus
	{
		get
		{
			if (CommissionPaid)
				return "Paid";

			return "ToBePaid";
		}
	}
}