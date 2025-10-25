using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class PaymentItemConfiguration : BaseEntityConfiguration<Entities.PaymentItem>
{
	public override void Configure(EntityTypeBuilder<Entities.PaymentItem> builder)
	{
		base.Configure(builder);

		//builder.HasOne(x => x.Payment)
		//	.WithMany(x => x.Items)
		//	.HasForeignKey(x => x.PaymentId)
		//	.IsRequired();

		builder.HasOne(x => x.Service)
			.WithMany()
			.HasForeignKey(x => x.ServiceId)
			.IsRequired();
	}
}