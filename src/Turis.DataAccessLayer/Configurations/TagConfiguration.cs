using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class TagConfiguration : BaseEntityConfiguration<Entities.Tag>
{
	public override void Configure(EntityTypeBuilder<Entities.Tag> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.Name).IsRequired().HasMaxLength(250);
		builder.Property(e => e.Description);
		builder.Property(e => e.Color).IsRequired().HasMaxLength(10);
	}
}