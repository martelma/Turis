using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;
using Turis.DataAccessLayer.Entities;

namespace Turis.DataAccessLayer.Configurations;

public class JournalEntryConfiguration : BaseEntityConfiguration<JournalEntry>
{
	public override void Configure(EntityTypeBuilder<JournalEntry> builder)
	{
		builder.HasOne(x => x.User)
			.WithMany()
			.HasForeignKey(x => x.UserId);

		builder.Property(x => x.TimeStamp).IsRequired().HasDefaultValueSql("GetDate()"); ;
		builder.Property(x => x.Date).IsRequired();
		builder.Property(x => x.Amount).IsRequired();
		builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
		builder.Property(x => x.Note);
		builder.Property(x => x.Balance).IsRequired();
	}
}