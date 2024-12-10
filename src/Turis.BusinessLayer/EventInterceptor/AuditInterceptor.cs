using System.Diagnostics;
using MiBox.BusinessLayer.EntityExtensions;
using MiBox.DataAccessLayer;

namespace MiBox.BusinessLayer.EventInterceptor;

public class AuditInterceptor :
	INotificationHandler<CreatedDomainEvent<ProductionCenter>>,
	INotificationHandler<UpdatedDomainEvent<ProductionCenter>>,
	INotificationHandler<DeletedDomainEvent<ProductionCenter>>
{
	private readonly ApplicationDbContext _dbContext;

	public AuditInterceptor(ApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public virtual async Task Handle(CreatedDomainEvent<ProductionCenter> notification, CancellationToken cancellationToken)
	{
	}

	public virtual async Task Handle(UpdatedDomainEvent<ProductionCenter> notification, CancellationToken cancellationToken)
	{
		//if (typeof(ProductionCenter).Name == nameof(ProductionCenter))
		//{
		//}
			var newObjViewModel = notification.NewEntity.ToViewModel();
			Debug.WriteLine(newObjViewModel.ToJsonString());
	}

	public virtual async Task Handle(DeletedDomainEvent<ProductionCenter> notification, CancellationToken cancellationToken)
	{
	}
}