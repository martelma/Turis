namespace Turis.Common.Models.Requests;

public class ApplicationScopeRequest
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public string Description { get; set; }
	public Guid? ScopeGroupId { get; set; }
}