using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.Common.Enums;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class TargetConfiguration : BaseEntityConfiguration<Entities.Target>
{
	public override void Configure(EntityTypeBuilder<Entities.Target> builder)
	{
		base.Configure(builder);

		builder
			.HasOne(x => x.Collaborator)
			.WithMany()
			.HasForeignKey(x => x.CollaboratorId)
			.IsRequired();

		builder.Property(x => x.Year);
		builder.Property(x => x.Month);
		builder.Property(x => x.AmountMin);
		builder.Property(x => x.AmountMax);
		builder.Property(x => x.PercentageMin);
		builder.Property(x => x.PercentageMax);
	}
}