using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Configurations.Base;

namespace Turis.DataAccessLayer.Configurations;

public class LanguageConfiguration : BaseEntityConfiguration<Entities.Language>
{
	public override void Configure(EntityTypeBuilder<Entities.Language> builder)
	{
		base.Configure(builder);

		builder.Property(e => e.Code).IsRequired().HasMaxLength(5);
		builder.Property(e => e.Name).IsRequired().HasMaxLength(50);
		builder.Property(e => e.CodeIso).IsRequired().HasMaxLength(5);
	}
}