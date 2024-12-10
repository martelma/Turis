using Turis.BusinessLayer.DomainEvents.Base;
using Turis.BusinessLayer.Projections.Base;

namespace Turis.BusinessLayer.Projections.Identity;

public class ApplicationScopeGroupProjection : BaseHashProjection<ApplicationScopeGroup, ApplicationScopeGroupViewModel, ApplicationScopeGroupRepository>
    , INotificationHandler<CreatedDomainEvent<ApplicationScopeGroup>>
    , INotificationHandler<UpdatedDomainEvent<ApplicationScopeGroup>>
    , INotificationHandler<DeletedDomainEvent<ApplicationScopeGroup>>
{
    public ApplicationScopeGroupProjection(ApplicationScopeGroupRepository repository, RedisService redisService) : base(repository, redisService)
    {
    }

    public override ApplicationScopeGroupViewModel ToModel(ApplicationScopeGroup entity)
    {
        return entity.ToViewModel();
    }
}