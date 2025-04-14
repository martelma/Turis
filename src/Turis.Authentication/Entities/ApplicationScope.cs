namespace Turis.Authentication.Entities;

public class ApplicationScope
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public Guid ApplicationId { get; set; }
    public virtual Application Application { get; set; }

	public Guid? ScopeGroupId { get; set; }
    public ApplicationScopeGroup ScopeGroup { get; set; }

    public virtual ICollection<ApplicationRoleScope> Roles { get; set; }

}
