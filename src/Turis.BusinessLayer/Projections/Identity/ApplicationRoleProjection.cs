using Turis.Authentication.Entities;
using Turis.BusinessLayer.DomainEvents.Base;
using Turis.BusinessLayer.Projections.Base;

namespace Turis.BusinessLayer.Projections.Identity;

public class ApplicationRoleProjection : BaseHashProjection<ApplicationRole, ApplicationRoleViewModel, ApplicationRoleRepository>
    , INotificationHandler<CreatedDomainEvent<ApplicationRole>>
    , INotificationHandler<UpdatedDomainEvent<ApplicationRole>>
    , INotificationHandler<DeletedDomainEvent<ApplicationRole>>
{
    public ApplicationRoleProjection(ApplicationRoleRepository repository, RedisService redisService) : base(repository, redisService)
    {
    }

    public override ApplicationRoleViewModel ToModel(ApplicationRole entity)
    {
        return entity.ToViewModel();
    }
}