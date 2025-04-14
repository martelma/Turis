using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Turis.Authentication.Entities;

namespace Turis.Authentication;

public class AuthenticationDbContext(DbContextOptions options)
		: IdentityDbContext<ApplicationUser, ApplicationRole, Guid, IdentityUserClaim<Guid>, ApplicationUserRole, IdentityUserLogin<Guid>, IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>(options)
{
	public DbSet<Application> Applications { get; set; }

	protected override void OnModelCreating(ModelBuilder builder)
	{
		base.OnModelCreating(builder);

		builder.Entity<Application>(entity =>
		{
			entity.ToTable("Applications");

			entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
			entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
			entity.Property(e => e.Description);
			entity.Property(e => e.Icon).HasMaxLength(255);
			entity.Property(e => e.Url).IsRequired().HasMaxLength(255);
			entity.Property(e => e.ViewOrder);
		});

		builder.Entity<ApplicationUser>(entity =>
		{
			entity.Property(e => e.FirstName).IsRequired().HasMaxLength(128);
			entity.Property(e => e.LastName).IsRequired().HasMaxLength(128);
			entity.Property(x => x.AvatarUrl).HasMaxLength(150);
			entity.Property(x => x.Language).HasMaxLength(5);
		});

		builder.Entity<ApplicationRole>(entity =>
		{
			entity.Metadata.RemoveIndex(new[] { entity.Property(r => r.NormalizedName).Metadata });
			entity.HasIndex(r => new { r.NormalizedName, r.ApplicationId }).HasDatabaseName("RoleNameIndex").IsUnique();

			entity.Property(r => r.Name);
			entity.Property(r => r.NormalizedName);
			entity.Property(r => r.Description);

			entity.HasOne(r => r.Application)
				.WithMany(a => a.Roles)
				.HasForeignKey(r => r.ApplicationId)
				.HasConstraintName("FK_Applications_AspNetRoles")
				.IsRequired();
		});

		builder.Entity<ApplicationScope>(entity =>
		{
			entity.ToTable("AspNetScopes");

			entity.HasIndex(e => e.ScopeGroupId, "IX_AspNetScopes_ScopeGroupId");

			entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
			entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
			entity.Property(r => r.Description);

			entity.HasOne(s => s.Application)
				.WithMany(a => a.Scopes)
				.HasForeignKey(r => r.ApplicationId)
				.HasConstraintName("FK_Applications_AspNetScopes")
				.IsRequired();

			entity.HasOne(s => s.ScopeGroup)
				.WithMany(sg => sg.Scopes)
				.HasForeignKey(s => s.ScopeGroupId)
				.HasConstraintName("FK_AspNetScopes_AspNetScopeGroups")
				.IsRequired(false);
		});

		builder.Entity<ApplicationScopeGroup>(entity =>
		{
			entity.ToTable("AspNetScopeGroups");

			entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
			entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
			entity.Property(r => r.Description);

			entity.HasOne(s => s.Application)
				.WithMany(a => a.ScopeGroups)
				.HasForeignKey(r => r.ApplicationId)
				.HasConstraintName("FK_Applications_AspNetScopeGroups")
				.IsRequired();
		});

		builder.Entity<ApplicationUserRole>(userRole =>
		{
			userRole.HasKey(ur => new { ur.UserId, ur.RoleId });

			userRole.HasOne(ur => ur.Role)
				.WithMany(r => r.UserRoles)
				.HasForeignKey(ur => ur.RoleId)
				.IsRequired();

			userRole.HasOne(ur => ur.User)
				.WithMany(r => r.UserRoles)
				.HasForeignKey(ur => ur.UserId)
				.IsRequired();
		});

		builder.Entity<ApplicationRoleScope>(roleScope =>
		{
			roleScope.ToTable("ApplicationRoleScopes");

			roleScope.HasKey(rs => new { rs.RoleId, rs.ScopeId });

			roleScope.HasOne(rs => rs.Role)
				.WithMany(r => r.Scopes)
				.HasForeignKey(rs => rs.RoleId)
				.IsRequired();

			roleScope.HasOne(rs => rs.Scope)
				.WithMany(r => r.Roles)
				.HasForeignKey(rs => rs.ScopeId)
				.IsRequired();
		});
	}

	protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
	{
		configurationBuilder.Properties<string>().AreUnicode(false);
		base.ConfigureConventions(configurationBuilder);
	}
}
