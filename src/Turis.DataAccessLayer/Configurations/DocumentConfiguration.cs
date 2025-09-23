using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.Common.Enums;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class DocumentConfiguration : BaseEntityConfiguration<Entities.Document>
{
	public override void Configure(EntityTypeBuilder<Entities.Document> builder)
	{
		base.Configure(builder);

		builder.HasOne(x => x.DocumentRef)
			.WithMany()
			.HasForeignKey(x => x.DocumentRefId)
			.IsRequired(false);

		builder
			.Property(x => x.Type)
			.HasConversion(
				x => x.ToString(),
				x => (DocumentType)Enum.Parse(typeof(DocumentType), x));

		builder
			.Property(x => x.Status)
			.HasConversion(
				x => x.ToString(),
				x => (DocumentStatus)Enum.Parse(typeof(DocumentStatus), x));

		builder.HasOne(x => x.Client)
			.WithMany()
			.HasForeignKey(x => x.ClientId);

		builder.Property(e => e.IdSdi).HasMaxLength(20);
		builder.Property(e => e.Date);
		builder.Property(e => e.Sectional).HasMaxLength(6);
		builder.Property(e => e.Number);
		builder.Property(e => e.DiscountPercentage).IsRequired();
		builder.Property(e => e.Discount).IsRequired();
		builder.Property(e => e.Amount).IsRequired();
		builder.Property(e => e.VatRate).IsRequired();
		builder.Property(e => e.Vat).IsRequired();
		builder.Property(e => e.AliquotaRitenutaDiAcconto).IsRequired();
		builder.Property(e => e.RitenutaDiAcconto).IsRequired();
		builder.Property(e => e.TotalExpenses).IsRequired();
		builder.Property(e => e.TotalExemptExpenses).IsRequired();
		builder.Property(e => e.Total).IsRequired();
		builder.Property(e => e.ImportoBollo);
		builder.Property(e => e.DesTipoPagamento).HasMaxLength(100);
		builder.Property(e => e.Saldato).IsRequired();
		builder.Property(e => e.DataIncasso);

		builder.HasOne(x => x.Collaborator)
			.WithMany()
			.HasForeignKey(x => x.CollaboratorId)
			.IsRequired(false);

		builder.Property(e => e.SdiCodiceTipoPagamento).HasMaxLength(4);
		builder.Property(e => e.SdiValoreTipoPagamento).HasMaxLength(100);
		builder.Property(e => e.SdiCodiceCondizionePagamento).HasMaxLength(4);
		builder.Property(e => e.DataScadenzaPagamento);
		builder.Property(e => e.IdDocumento).HasMaxLength(20);
		builder.Property(e => e.Cig).HasMaxLength(15);
		builder.Property(e => e.Cup).HasMaxLength(15);

		builder.HasMany(x => x.Items)
			.WithOne(x => x.Document)
			.HasForeignKey(x => x.DocumentId)
			.IsRequired();
	}
}