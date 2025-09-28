namespace Turis.Common.Models.Keyless;

public class CommissionStat
{
	public Guid CollaboratorId { get; set; }
	public string FirstName { get; set; } = string.Empty;
	public string LastName { get; set; } = string.Empty;
	public int Year { get; set; }
	public int Month { get; set; }
	public decimal AmountMin { get; set; }
	public decimal AmountMax { get; set; }
	public decimal PercentageMin { get; set; }
	public decimal PercentageMax { get; set; }
	public decimal Commission { get; set; }
	public decimal Total { get; set; }
	public decimal Percentage { get; set; }
}