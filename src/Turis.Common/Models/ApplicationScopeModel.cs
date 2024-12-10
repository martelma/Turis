namespace Turis.Common.Models;

public class ApplicationScopeModel
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public Guid? ScopeGroupId { get; set; }

    public string ScopeGroupName { get; set; }

    public Guid ApplicationId { get; set; }

    public List<Guid> RoleIds { get; set; } = [];
}
