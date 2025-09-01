using System.Reflection;
using EntityFramework.Exceptions.SqlServer;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Turis.Authentication;
using Turis.Authentication.Entities;
using Turis.DataAccessLayer.Entities;

namespace Turis.DataAccessLayer;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : AuthenticationDbContext(options), IDbContext, IDataProtectionKeyContext
{
	public DbSet<EventLog> EventLogs { get; set; }
	public DbSet<ApplicationScopeGroup> ApplicationScopeGroups { get; set; }
	public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
	public DbSet<Tag> Tags { get; set; }
	public DbSet<Language> Languages { get; set; }
	public DbSet<AliquotaIva> AliquoteIva { get; set; }
	public DbSet<PriceList> PriceLists { get; set; }
	public DbSet<Service> Services { get; set; }
	public DbSet<Contact> Contacts { get; set; }
	public DbSet<Document> Documents { get; set; }
	public DbSet<DocumentItem> DocumentItems { get; set; }
	public DbSet<Bookmark> Bookmarks { get; set; }
	public DbSet<Attachment> Attachments { get; set; }
	public DbSet<EntityTag> EntityTags { get; set; }
	public DbSet<JournalEntry> JournalEntries { get; set; }
	public DbSet<Proposal> Proposals { get; set; }

	protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
	{
		optionsBuilder.UseExceptionProcessor();
		base.OnConfiguring(optionsBuilder);
	}

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);
		modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

		modelBuilder.Entity<JournalEntry>()
			.ToTable(tb => tb.HasTrigger("trg_Balance"));
	}


	protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
	{
		configurationBuilder.Properties<string>().AreUnicode(false);
		base.ConfigureConventions(configurationBuilder);
	}

	public IQueryable<T> GetData<T>(bool trackingChanges = false) where T : class
	{
		var set = Set<T>();
		return trackingChanges ? set.AsTracking() : set.AsNoTrackingWithIdentityResolution();
	}

	public ValueTask<T> GetAsync<T>(params object[] keyValues) where T : class
		=> Set<T>().FindAsync(keyValues);

	public void Insert<T>(T entity) where T : class => Set<T>().Add(entity);

	public void Delete<T>(T entity) where T : class => Set<T>().Remove(entity);

	public void Delete<T>(IEnumerable<T> entities) where T : class => Set<T>().RemoveRange(entities);

	public async Task SaveAsync()
		=> await SaveChangesAsync().ConfigureAwait(false);

	public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
	{
		var entries = ChangeTracker.Entries()
			.Where(e => e.State == EntityState.Added);

		foreach (var entry in entries)
		{
			if (entry.Entity is not IApplicationEntity entity)
				continue;

			if (IsEmptyId(entity))
				entity.Id = Guid.NewGuid();
		}

		return await base.SaveChangesAsync(cancellationToken);
	}

	private static bool IsEmptyId<TEntity>(TEntity entity) where TEntity : IApplicationEntity
	{
		var idProperty = typeof(TEntity).GetProperty(nameof(IApplicationEntity.Id));
		var value = idProperty?.GetValue(entity);

		if (value is Guid guidValue)
			return guidValue == Guid.Empty;

		return value != null;
	}

	public Task ExecuteTransactionAsync(Func<Task> action)
	{
		var strategy = Database.CreateExecutionStrategy();
		return strategy.ExecuteAsync(async () =>
		{
			using var transaction = await Database.BeginTransactionAsync().ConfigureAwait(false);
			await action.Invoke().ConfigureAwait(false);
			await transaction.CommitAsync().ConfigureAwait(false);
		});
	}
}
