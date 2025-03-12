using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class ServiceSummaryModel : BaseModel
{
	public int Proposals { get; set; }
	public int WeekProposals { get; set; }
	public int Checked { get; set; }
	public int CheckedToAssign { get; set; }
	public int ToDo { get; set; }
	public int WeekToDo { get; set; }
	public int Done { get; set; }
	public int WeekDone { get; set; }
}