using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class ContactConfiguration : BaseEntityConfiguration<Entities.Contact>
{
	public override void Configure(EntityTypeBuilder<Entities.Contact> builder)
	{
		base.Configure(builder);

		builder.Property(x => x.Code).HasMaxLength(20);
		builder.Property(x => x.ExternalCode).HasMaxLength(20);
		builder.Property(x => x.Title).HasMaxLength(20);
		builder.Property(x => x.Sex).HasMaxLength(2);

		builder
			.HasOne(x => x.Language)
			.WithMany()
			.HasForeignKey(x => x.LanguageId)
			.IsRequired(false);

		builder.Property(x => x.FirstName).HasMaxLength(150);
		builder.Property(x => x.LastName).HasMaxLength(150);
		builder.Property(x => x.FiscalCode).HasMaxLength(50);
		builder.Property(x => x.TaxCode).HasMaxLength(50);
		builder.Property(x => x.CompanyName).HasMaxLength(150);
		builder.Property(x => x.BirthDate);
		builder.Property(x => x.BirthPlace).HasMaxLength(150);
		builder.Property(x => x.Address).HasMaxLength(150);
		builder.Property(x => x.City).HasMaxLength(150);
		builder.Property(x => x.CAP).HasMaxLength(10);
		builder.Property(x => x.RegionalCode).HasMaxLength(50);
		builder.Property(x => x.StateCode).HasMaxLength(50);
		builder.Property(x => x.Phone).HasMaxLength(50);
		builder.Property(x => x.PhoneCell).HasMaxLength(50);
		builder.Property(x => x.Fax).HasMaxLength(50);
		builder.Property(x => x.Web).HasMaxLength(50);
		builder.Property(x => x.EMail).HasMaxLength(50);
		builder.Property(x => x.EMailAccounting).HasMaxLength(50);
		builder.Property(x => x.Pec).HasMaxLength(50);
		builder.Property(x => x.SdiCode).HasMaxLength(50);
		builder.Property(x => x.Note);
		builder.Property(x => x.DocumentType).HasMaxLength(10);
		builder.Property(x => x.PercentageGuida);
		builder.Property(x => x.PercentageAccompagnamento);
		builder.Property(x => x.Note);
		builder.Property(x => x.IsClient);
		builder.Property(x => x.IsCollaborator);
	}
}