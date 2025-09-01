using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;
using Turis.DataAccessLayer.Entities;

namespace Turis.DataAccessLayer.Configurations;

public class EventLogConfiguration : BaseEntityConfiguration<EventLog>
{
    public override void Configure(EntityTypeBuilder<EventLog> builder)
    {
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);

        builder.Property(x => x.TimeStamp).IsRequired().HasDefaultValueSql("GetDate()"); ;
        builder.Property(x => x.EntityName).IsRequired().HasMaxLength(50);
        builder.Property(x => x.EntityKey).IsRequired().HasMaxLength(40);
        builder.Property(x => x.EventName).IsRequired().HasMaxLength(50);
        builder.Property(x => x.AdditionalInfo).HasMaxLength(500);
    }
}