using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class ContactModel : BaseModel
{
	public string Code { get; set; }
	public string ExternalCode { get; set; }
	public string Title { get; set; }
	public string Sex { get; set; }
	public string[] Languages { get; set; }
	//public LanguageModel Language { get; set; }
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public string FiscalCode { get; set; }
	public string TaxCode { get; set; }
	public string CompanyName { get; set; }
	public DateTimeOffset? BirthDate { get; set; }
	public string BirthDateText { get; set; }
	public string BirthPlace { get; set; }
	public string Address { get; set; }
	public string City { get; set; }
	public string Cap { get; set; }
	public string RegionalCode { get; set; }
	public string StateCode { get; set; }
	public string Phone1 { get; set; }
	public string Phone2 { get; set; }
	public string Fax { get; set; }
	public string Web { get; set; }
	public string EMail { get; set; }
	public string EMailAccounting { get; set; }
	public string Pec { get; set; }
	public string SdiCode { get; set; }
	public string Note { get; set; }
	public string DocumentType { get; set; }
	public string ContactType { get; set; }
	public decimal PercentageGuida { get; set; }
	public decimal PercentageAccompagnamento { get; set; }
	public string Avatar { get; set; }
	public string DisplayName { get; set; }
	public string BookmarkId { get; set; }
	public int AttachmentsCount { get; set; }
	public List<TagModel> Tags { get; set; } = [];

	public string FullName
	{
		get
		{
			if (ContactType == Enums.ContactType.Collaborator.ToString())
				return $"{FirstName} {LastName}";
			if (ContactType == Enums.ContactType.Client.ToString())
				return CompanyName;
			return string.Empty;
		}
	}
}