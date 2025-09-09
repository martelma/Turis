using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class ServiceRelationConfiguration : BaseEntityConfiguration<Entities.ServiceRelation>
{
	public override void Configure(EntityTypeBuilder<Entities.ServiceRelation> builder)
	{
		base.Configure(builder);

		builder
			.HasOne(x => x.SourceService)
			.WithMany(s => s.RelatedServices)
			.HasForeignKey(x => x.SourceServiceId)
			.OnDelete(DeleteBehavior.Restrict);

		builder
			.HasOne(x => x.TargetService)
			.WithMany(s => s.LinkedFromServices)
			.HasForeignKey(x => x.TargetServiceId)
			.OnDelete(DeleteBehavior.Restrict);
	}
}