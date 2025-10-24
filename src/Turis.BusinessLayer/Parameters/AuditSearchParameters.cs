using JeMa.Shared.Parameters.Base;
using Microsoft.AspNetCore.Mvc;

namespace Turis.BusinessLayer.Parameters;

public class AuditSearchParameters : PaginationParameters
{
    [FromQuery]
    public string EntityKey { get; set; }
    [FromQuery]
    public string Pattern { get; set; }
}
