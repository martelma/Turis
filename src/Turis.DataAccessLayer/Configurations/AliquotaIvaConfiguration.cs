using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class AliquotaIvaConfiguration : BaseEntityConfiguration<Entities.AliquotaIva>
{
	public override void Configure(EntityTypeBuilder<Entities.AliquotaIva> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.Code).IsRequired().HasMaxLength(5);
		builder.Property(e => e.Name).IsRequired().HasMaxLength(50);
		builder.Property(e => e.Description).HasMaxLength(500);
		builder.Property(e => e.Aliquota);
		builder.Property(e => e.CodiceNatura).HasMaxLength(5);
	}
}