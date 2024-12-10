using Turis.Common.Services;

namespace Turis.Common.Interfaces;

public interface ICachedEntity<TEntity, TProjectionModel> : ICachedEntity
{
    //static abstract TProjectionModel ToViewModel(TEntity entity, IServiceProvider serviceProvider);
    static abstract TProjectionModel ToViewModel(TEntity entity, ScopedServiceProviderAccessor serviceProviderAccessor);
}

public interface ICachedEntity : IEntity
{
    string RedisId { get; set; }
}