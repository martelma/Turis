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
	public double Percentage
	{
		get
		{
			var commission = CommissionStat.Sum(x => x.Commission);
			var total = CommissionStat.Sum(x => x.Total);
			
			return (double)commission / (double)total * 100;
		}
	}
}