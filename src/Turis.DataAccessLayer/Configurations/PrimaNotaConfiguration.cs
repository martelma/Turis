using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;
using Turis.DataAccessLayer.Entities;

namespace Turis.DataAccessLayer.Configurations;

public class PrimaNotaConfiguration : BaseEntityConfiguration<PrimaNota>
{
    public override void Configure(EntityTypeBuilder<PrimaNota> builder)
    {
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);

        builder.Property(x => x.TSInserimento).IsRequired().HasDefaultValueSql("GetDate()");
        builder.Property(x => x.Descrizione).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Data).IsRequired();
        builder.Property(x => x.Entrata).IsRequired().HasDefaultValueSql("0");
        builder.Property(x => x.Uscita).IsRequired().HasDefaultValueSql("0");
    }
}