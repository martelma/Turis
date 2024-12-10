namespace Turis.WebApi.Controllers.Base;

public class BaseEntityApiController<TEntity, TViewModel> : ApiController
    where TEntity : ICachedEntity, new()
    where TViewModel : IViewModel, new()
{

    public BaseEntityApiController(
        ApplicationDbContext context,
        RedisService redisService,
        IHubContext<NotificationHub, INotificationHub> notificationHubContext,
        IMediator mediator) : base(context, redisService, notificationHubContext, mediator)
    {
    }
}