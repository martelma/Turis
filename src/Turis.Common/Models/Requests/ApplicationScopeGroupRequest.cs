namespace Turis.Common.Models.Requests;

public class ApplicationScopeGroupRequest
{
	public Guid Id { get; set; }
	public Guid ApplicationId { get; set; }
	public string Name { get; set; }
	public string Description { get; set; }
}