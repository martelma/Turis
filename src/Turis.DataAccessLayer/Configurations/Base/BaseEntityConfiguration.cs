using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Configurations.Base;

	public class BaseEntityConfiguration<T> : IEntityTypeConfiguration<T>
		where T : BaseEntity
	{
		public virtual void Configure(EntityTypeBuilder<T> builder)
		{
			builder.Property(x => x.Id).ValueGeneratedNever();
			builder.HasKey(x => x.Id);
		}
	}
