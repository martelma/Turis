namespace Turis.DataAccessLayer;

public interface IDbContext
{
    IQueryable<T> GetData<T>(bool trackingChanges = false) where T : class;

    ValueTask<T> GetAsync<T>(params object[] keyValues) where T : class;

    void Insert<T>(T entity) where T : class;

    void Delete<T>(T entity) where T : class;

    void Delete<T>(IEnumerable<T> entities) where T : class;

    Task SaveAsync();

    Task ExecuteTransactionAsync(Func<Task> action);
}
