using Turis.BusinessLayer.DomainEvents.Base;
using Turis.BusinessLayer.Projections.Base;

namespace Turis.BusinessLayer.Projections.Identity;

public class ApplicationUserProjection : BaseHashProjection<ApplicationUser, ApplicationUserViewModel, UserRepository>
    , INotificationHandler<CreatedDomainEvent<ApplicationUser>>
    , INotificationHandler<UpdatedDomainEvent<ApplicationUser>>
    , INotificationHandler<DeletedDomainEvent<ApplicationUser>>
{
    public ApplicationUserProjection(UserRepository repository, RedisService redisService) : base(repository, redisService)
    {
    }

    public override ApplicationUserViewModel ToModel(ApplicationUser entity)
    {
        return entity.ToViewModel();
    }
}