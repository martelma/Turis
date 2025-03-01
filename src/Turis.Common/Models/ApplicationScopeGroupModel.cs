namespace Turis.Common.Models;

public class ApplicationScopeGroupModel
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public IEnumerable<ApplicationScopeModel> Scopes { get; set; } = [];
}
