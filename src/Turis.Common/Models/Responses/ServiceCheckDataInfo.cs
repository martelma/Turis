namespace Turis.Common.Models.Responses;

public class ServiceCheckDataInfo
{
	public Guid ServiceId { get; set; }
	public string Code { get; set; }
	public string Title { get; set; }
	public DateTimeOffset Date { get; set; }
	public string DateText { get; set; }
	public string ServiceType { get; set; }
	public string DurationType { get; set; }
	public string Status { get; set; }
	public string[] Languages { get; set; }
	public string Location { get; set; }
	public int People { get; set; }
	public Guid? ClientId { get; set; }
	public ContactModel Client { get; set; }
	public Guid? CollaboratorId { get; set; }
	public ContactModel Collaborator { get; set; }
	public string WorkflowCollaboratorStatus { get; set; }
}