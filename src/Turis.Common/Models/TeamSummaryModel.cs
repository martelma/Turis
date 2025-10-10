using NPOI.SS.Formula.Functions;
using Turis.Common.Models.Base;
using Turis.Common.Models.Keyless;

namespace Turis.Common.Models;

public class TeamSummaryModel : BaseModel
{
	public List<TeamMemberModel> Members { get; set; } = [];

}

public class TeamMemberModel : BaseModel
{
	public ContactModel Collaborator { get; set; }
	public List<CommissionStat> CommissionStat { get; set; } = [];
	public decimal Commission => CommissionStat.Sum(x => x.Commission);
	public decimal Total => CommissionStat.Sum(x => x.Total);
	public double Percentage => (double)Commission / (double)Total * 100;
}