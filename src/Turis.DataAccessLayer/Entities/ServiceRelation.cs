using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class ServiceRelation : BaseEntity
{
	public Guid SourceServiceId { get; set; }
	public Service SourceService { get; set; }

	public Guid TargetServiceId { get; set; }
	public Service TargetService { get; set; }
}