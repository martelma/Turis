using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class TargetModel : BaseModel
{
	public Guid CollaboratorId { get; set; }
	public ContactModel Collaborator { get; set; }
	public int Year { get; set; }
	public int Month { get; set; }
	public decimal AmountMin { get; set; }
	public decimal AmountMax { get; set; }
	public decimal PercentageMin { get; set; }
	public decimal PercentageMax { get; set; }
}