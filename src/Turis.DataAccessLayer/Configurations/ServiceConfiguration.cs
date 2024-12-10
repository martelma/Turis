using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.Common.Enums;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class ServiceConfiguration : BaseEntityConfiguration<Entities.Service>
{
	public override void Configure(EntityTypeBuilder<Entities.Service> builder)
	{
		base.Configure(builder);

		builder.Property(x => x.Code).IsRequired().HasMaxLength(10);
		builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
		builder.Property(x => x.Date).IsRequired();

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

		builder.Property(x => x.Languages).HasMaxLength(50);
		builder.Property(x => x.Referent).HasMaxLength(150);
		builder.Property(x => x.ReferentPhone).HasMaxLength(50);
		builder.Property(x => x.Note);
		builder.Property(x => x.UserId).IsRequired();
		builder.Property(x => x.CreationDate).IsRequired();

		builder
			.Property(x => x.Status)
			.HasConversion(
				x => x.ToString(),
				x => (ServiceStatus)Enum.Parse(typeof(ServiceStatus), x));

		builder
			.Property(x => x.WorkflowCollaboratorStatus)
			.HasConversion(
				x => x.ToString(),
				x => (WorkflowCollaboratorStatus)Enum.Parse(typeof(WorkflowCollaboratorStatus), x));

		builder.Property(x => x.OptionExpiration);
		builder.Property(x => x.Location).IsRequired().HasMaxLength(250);
		builder.Property(x => x.MeetingPlace).HasMaxLength(250);
		builder.Property(x => x.People).IsRequired();
		builder.Property(x => x.Checked).IsRequired();

		builder
			.HasOne(x => x.PriceList)
			.WithMany()
			.HasForeignKey(x => x.PriceListId)
			.IsRequired(false);

		builder.Property(x => x.PriceCalculated).IsRequired();
		builder.Property(x => x.Price).IsRequired();

		builder
			.HasOne(x => x.Client)
			.WithMany()
			.HasForeignKey(x => x.ClientId)
			.IsRequired(false);

		builder
			.HasOne(x => x.Collaborator)
			.WithMany()
			.HasForeignKey(x => x.CollaboratorId)
			.IsRequired(false);

		builder.Property(x => x.CIGCode).HasMaxLength(50);
		builder.Property(x => x.CUPCode).HasMaxLength(50);
		builder.Property(x => x.CashedIn).IsRequired();
		builder.Property(x => x.CashedDate);

		builder.Property(x => x.CommissionPercentage).IsRequired();
		builder.Property(x => x.CommissionCalculated).IsRequired();
		builder.Property(x => x.Commission).IsRequired();
		builder.Property(x => x.CommissionNote).HasMaxLength(500);
		builder.Property(x => x.CommissionPaid).IsRequired();
		builder.Property(x => x.CommissionPaymentDate);
	}
}