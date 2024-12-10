using System.Text.Json.Serialization;
using JeMa.Shared.CustomAttributes;
using TinyHelpers.Json.Serialization;
using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class BookmarkModel : BaseModel
{
    public string UserId { get; set; }
    public string EntityName { get; set; }
    public string EntityId { get; set; }
    [JsonConverter(typeof(UtcDateTimeConverter))]
    [SortField("Date")]
    public DateTime Date { get; set; }
}

