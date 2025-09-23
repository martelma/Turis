using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class PaymentTypeConfiguration : BaseEntityConfiguration<Entities.PaymentType>
{
	public override void Configure(EntityTypeBuilder<Entities.PaymentType> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.Code).IsRequired().HasMaxLength(20);
		builder.Property(e => e.Name).IsRequired().HasMaxLength(250);
		builder.Property(e => e.Note);
		builder.Property(e => e.SdiCode).HasMaxLength(20);
		builder.Property(e => e.SdiName).HasMaxLength(250);
	}
}