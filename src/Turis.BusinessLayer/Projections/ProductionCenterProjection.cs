using Turis.BusinessLayer.DomainEvents.Base;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Projections.Base;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Projections;

public class ProductionCenterProjection : BaseHashProjection<ProductionCenter, ProductionCenterViewModel, ProductionCenterRepository>
	, INotificationHandler<CreatedDomainEvent<ProductionCenter>>
	, INotificationHandler<UpdatedDomainEvent<ProductionCenter>>
	, INotificationHandler<DeletedDomainEvent<ProductionCenter>>
{
	public ProductionCenterProjection(ProductionCenterRepository repository, RedisService redisService) : base(repository, redisService)
	{
	}

	public override ProductionCenterViewModel ToModel(ProductionCenter entity)
	{
		return entity.ToViewModel();
	}
}