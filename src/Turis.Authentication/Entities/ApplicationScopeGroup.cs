namespace Turis.Authentication.Entities;

public class ApplicationScopeGroup
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public Guid ApplicationId { get; set; }

    public virtual Application Application { get; set; }

    public virtual ICollection<ApplicationScope> Scopes { get; set; }
}
