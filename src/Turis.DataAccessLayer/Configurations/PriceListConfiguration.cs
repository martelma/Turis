using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.Common.Enums;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class PriceListConfiguration : BaseEntityConfiguration<Entities.PriceList>
{
	public override void Configure(EntityTypeBuilder<Entities.PriceList> builder)
	{
		base.Configure(builder);

		builder.Property(x => x.Code).IsRequired().HasMaxLength(10);
		builder.Property(x => x.Name).IsRequired().HasMaxLength(250);
		
		builder
			.Property(x => x.ServiceType)
			.HasConversion(
				x => x.ToString(),
				x => (ServiceType)Enum.Parse(typeof(ServiceType), x));
		
		builder
			.Property(x => x.DurationType)
			.HasConversion(
				x => x.ToString(),
				x => (DurationType)Enum.Parse(typeof(DurationType), x));

		builder.Property(x => x.MaxCount).IsRequired();
		builder.Property(x => x.Price).IsRequired();
		builder.Property(x => x.PriceExtra).IsRequired();
	}
}