using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class PaymentConfiguration : BaseEntityConfiguration<Entities.Payment>
{
	public override void Configure(EntityTypeBuilder<Entities.Payment> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.Date);

		builder.HasOne(x => x.Collaborator)
			.WithMany()
			.HasForeignKey(x => x.CollaboratorId)
			.IsRequired(false);

		builder.Property(e => e.VatRate).IsRequired();
		builder.Property(e => e.Vat).IsRequired();

		builder.Property(e => e.WithholdingTaxRate).IsRequired();
		builder.Property(e => e.WithholdingTax).IsRequired();
		
		builder.Property(e => e.Amount).IsRequired();
		builder.Property(e => e.Total).IsRequired();
		
		builder.Property(e => e.Note);

		builder.HasMany(x => x.Items)
			.WithOne(x => x.Payment)
			.HasForeignKey(x => x.PaymentId)
			.IsRequired();
	}
}