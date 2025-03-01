using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;
using Turis.DataAccessLayer.Entities;

namespace Turis.DataAccessLayer.Configurations;

public class EntityTagConfiguration : BaseEntityConfiguration<EntityTag>
{
	public override void Configure(EntityTypeBuilder<EntityTag> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.EntityKey).IsRequired();
		builder.Property(e => e.EntityName).IsRequired().HasMaxLength(100);
		builder.Property(e => e.UserId).IsRequired();
		builder.Property(e => e.TimeStamp).IsRequired();
		builder.Property(e => e.TagId).IsRequired();

		builder
			.HasOne(x => x.Tag)
			.WithMany()
			.HasForeignKey(x => x.TagId)
			.IsRequired();
	}
}