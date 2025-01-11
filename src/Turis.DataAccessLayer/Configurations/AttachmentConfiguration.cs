using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;
using Turis.DataAccessLayer.Entities;

namespace Turis.DataAccessLayer.Configurations;

public class AttachmentConfiguration : BaseEntityConfiguration<Attachment>
{
	public override void Configure(EntityTypeBuilder<Attachment> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.EntityKey).IsRequired();
		builder.Property(e => e.EntityName).IsRequired().HasMaxLength(100);
		builder.Property(e => e.TimeStamp).IsRequired();
		builder.Property(e => e.Folder).HasMaxLength(50);
		builder.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(250);
		builder.Property(e => e.Type).IsRequired().HasMaxLength(7);
		builder.Property(e => e.Note);
	}
}