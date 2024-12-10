using Turis.Common.Interfaces;

namespace Turis.Common.Models.Base;

public class BaseRequest : IModel
{
	public BaseRequest()
	{

	}

	public Guid Id { get; set; }
}