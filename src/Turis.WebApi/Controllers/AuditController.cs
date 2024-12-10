using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

public class AuditController : ApiController
{
	private readonly AuditRepository _repository;

    public AuditController(
        ApplicationDbContext context,
		RedisService redisService,
        AuditRepository repository,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
        IMediator mediator) : base(context, redisService, notificationHubContext, mediator)
    {
	    _repository = repository;
    }

    [HttpGet("List/{id}")]
    public IEnumerable<AuditViewModel> List(string id)
    {
        var list = _repository.List(id);
        var model= list.Select(x =>x.ToViewModel());

        return model;
    }
}