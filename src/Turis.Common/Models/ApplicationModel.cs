
namespace Turis.Common.Models;

public class ApplicationModel
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public string Icon { get; set; }

    public string Url { get; set; }

    public int ViewOrder { get; set; }

    public IEnumerable<ApplicationRoleModel> Roles { get; set; } = [];
    public IEnumerable<ApplicationScopeModel> Scopes { get; set; } = [];
    public IEnumerable<ApplicationScopeGroupModel> ScopeGroups { get; set; } = [];
    public IEnumerable<UserModel> Users { get; set; } = [];
}
