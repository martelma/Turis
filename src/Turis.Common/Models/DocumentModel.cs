namespace Turis.Common.Models;

public class DocumentModel : DocumentInfoModel
{
	public List<DocumentItemModel> Items { get; set; } = [];
}