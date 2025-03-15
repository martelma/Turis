using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class JournalEntrySummaryModel : BaseModel
{
	public SummaryData YearData { get; set; }
	public SummaryData MonthData { get; set; }
	public SummaryData WeekData { get; set; }
}

public class SummaryData
{
	public List<DataItem> Data { get; set; } = [];

	public decimal TotalIncome => Data.Sum(x => x.Income);
	public decimal TotalExpense => Data.Sum(x => x.Expense);
	public decimal Balance => Data.Count > 0 ? Data.OrderBy(x => x.ViewOrder).Last().Balance : 0;
}

public class DataItem
{
	public int ViewOrder { get; set; }
	public string Label { get; set; }
	public decimal Income { get; set; }
	public decimal Expense { get; set; }
	public decimal Balance { get; set; }
}
