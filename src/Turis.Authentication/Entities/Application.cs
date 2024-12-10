namespace Turis.Authentication.Entities;

public class Application
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public string Icon { get; set; }

    public string Url { get; set; }

    public int ViewOrder { get; set; }

    public virtual ICollection<ApplicationRole> Roles { get; set; }

    public virtual ICollection<ApplicationScope> Scopes { get; set; }

    public virtual ICollection<ApplicationScopeGroup> ScopeGroups { get; set; }
}
