using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.Common.Enums;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class ProposalConfiguration : BaseEntityConfiguration<Entities.Proposal>
{
	public override void Configure(EntityTypeBuilder<Entities.Proposal> builder)
	{
		base.Configure(builder);

		builder.HasOne(x => x.Service)
			.WithMany()
			.HasForeignKey(x => x.ServiceId);

		builder.HasOne(x => x.Collaborator)
			.WithMany()
			.HasForeignKey(x => x.CollaboratorId);

		builder.Property(e => e.SendDate).IsRequired();
		builder.Property(e => e.ResponseDate).IsRequired(false);

		builder
			.Property(x => x.ResponseStatus)
			.HasConversion(
				x => x.ToString(),
				x => (ResponseStatusType)Enum.Parse(typeof(ResponseStatusType), x))
			.IsRequired(false);
	}
}