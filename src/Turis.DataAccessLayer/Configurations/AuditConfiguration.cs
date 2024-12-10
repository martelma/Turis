using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;
using Turis.DataAccessLayer.Entities;

namespace Turis.DataAccessLayer.Configurations;

public class AuditConfiguration : BaseEntityConfiguration<Audit>
{
    public override void Configure(EntityTypeBuilder<Audit> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Action).HasMaxLength(10);
        builder.Property(x => x.Date).IsRequired();
        builder.Property(e => e.UserId).IsRequired();
        builder.Property(x => x.EntityName).IsRequired().HasMaxLength(50);
        builder.Property(x => x.EntityKey).IsRequired().HasMaxLength(36);
        builder.Property(x => x.Values);
    }
}

