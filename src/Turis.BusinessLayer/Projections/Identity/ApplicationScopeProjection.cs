using Turis.BusinessLayer.DomainEvents.Base;
using Turis.BusinessLayer.Projections.Base;

namespace Turis.BusinessLayer.Projections.Identity;

public class ApplicationScopeProjection : BaseHashProjection<ApplicationScope, ApplicationScopeViewModel, ApplicationScopeRepository>
    , INotificationHandler<CreatedDomainEvent<ApplicationScope>>
    , INotificationHandler<UpdatedDomainEvent<ApplicationScope>>
    , INotificationHandler<DeletedDomainEvent<ApplicationScope>>
{
    public ApplicationScopeProjection(ApplicationScopeRepository repository, RedisService redisService) : base(repository, redisService)
    {
    }

    public override ApplicationScopeViewModel ToModel(ApplicationScope entity)
    {
        return entity.ToViewModel();
    }
}