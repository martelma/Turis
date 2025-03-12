namespace Turis.Common.Mailing;

public class ProposalEmailModel : BaseEmailModel
{
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public string FullName { get; set; }
	public string EMailSupport { get; set; }
	public string CallbackUrl { get; set; }
	public string ServiceCode { get; set; }
	public string ServiceTitle { get; set; }
	public DateTimeOffset ServiceDate { get; set; }
	public string ServiceClientCode { get; set; }
	public string ServiceClientCompanyName { get; set; }
}