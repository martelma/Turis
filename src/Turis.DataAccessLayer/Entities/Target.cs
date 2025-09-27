using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

[IndexAll]
public class Target : BaseEntity, ITemplate
{
	public Guid CollaboratorId { get; set; }
	public Contact Collaborator { get; set; }

	public int Year { get; set; }
	public int Month { get; set; }
	public decimal AmountMin { get; set; }
	public decimal AmountMax { get; set; }
	public decimal PercentageMin { get; set; }
	public decimal PercentageMax { get; set; }
}