using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class BookmarkConfiguration : BaseEntityConfiguration<Entities.Bookmark>
{
	public override void Configure(EntityTypeBuilder<Entities.Bookmark> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.UserId).IsRequired();
		builder.Property(e => e.EntityName).IsRequired().HasMaxLength(50);
        builder.Property(e => e.EntityId).IsRequired();
		builder.Property(e => e.Date).IsRequired();
	}
}