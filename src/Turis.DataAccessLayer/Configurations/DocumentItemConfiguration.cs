using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class DocumentItemConfiguration : BaseEntityConfiguration<Entities.DocumentItem>
{
	public override void Configure(EntityTypeBuilder<Entities.DocumentItem> builder)
	{
		base.Configure(builder);

		builder.HasOne(x => x.Document)
			.WithMany()
			.HasForeignKey(x => x.DocumentId);

		builder.Property(e => e.Row).IsRequired();
		builder.Property(e => e.Code).HasMaxLength(50);
		builder.Property(e => e.Description).IsRequired().HasMaxLength(150);
		builder.Property(e => e.CodiceNatura).HasMaxLength(2);
		builder.Property(e => e.RiferimentoNormativo).HasMaxLength(20);
		builder.Property(e => e.Quantity).IsRequired();
		builder.Property(e => e.Price).IsRequired();
		builder.Property(e => e.DiscountPercentage).IsRequired();
		builder.Property(e => e.VatRate).IsRequired();
		builder.Property(e => e.CodiceEsigibilitaIVA);
	}
}