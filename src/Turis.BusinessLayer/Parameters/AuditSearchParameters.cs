using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Parameters.Base;

namespace Turis.BusinessLayer.Parameters;

public class AuditSearchParameters : BaseSearchParameters
{
    [FromQuery]
    public string EntityKey { get; set; }
    [FromQuery]
    public string Pattern { get; set; }
}
