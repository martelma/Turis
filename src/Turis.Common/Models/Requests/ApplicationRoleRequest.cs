namespace Turis.Common.Models.Requests;

public class ApplicationRoleRequest
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public string Description { get; set; }
	public List<ApplicationScopeModel> Scopes { get; set; } = [];
}