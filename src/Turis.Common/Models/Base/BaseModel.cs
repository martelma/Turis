using Turis.Common.Interfaces;

namespace Turis.Common.Models.Base;

public class BaseModel : IModel
{
    public BaseModel()
    {

    }

    public Guid Id { get; set; }
}