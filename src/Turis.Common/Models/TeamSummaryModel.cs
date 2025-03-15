using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class TeamSummaryModel : BaseModel
{
	public IEnumerable<TeamMemberModel> Members { get; set; } = [];

}

public class TeamMemberModel : BaseModel
{
	public ContactModel Collaborator{ get; set; }
}