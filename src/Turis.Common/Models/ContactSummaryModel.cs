namespace Turis.Common.Models;

public class ContactSummaryModel
{
	public List<ContactSummaryDataModel> Years { get; set; } = [];
}

public class ContactSummaryDataModel
{
	public int ViewOrder { get; set; }
	public string Label { get; set; }
	public decimal Total { get; set; }
	public decimal Payed { get; set; }
	public List<ContactDataItemModel> Data { get; set; } = [];
}

public class ContactDataItemModel
{
	public int ViewOrder { get; set; }
	public string Label { get; set; }
	public decimal Value { get; set; }
}
