using Microsoft.Extensions.DependencyInjection;

namespace Turis.Common.Services;

public class ScopedServiceProvider : IDisposable
{
    private readonly IServiceScope scope;
    private readonly IServiceProvider serviceProvider;

    public ScopedServiceProvider(IServiceScope scope)
    {
        this.scope = scope;
    }

    public ScopedServiceProvider(IServiceProvider serviceProvider)
    {
        this.serviceProvider = serviceProvider;
    }

    public T GetService<T>() where T : class
        => scope?.ServiceProvider.GetService<T>() ?? serviceProvider.GetService<T>();

    public T GetRequiredService<T>() where T : class
        => scope?.ServiceProvider.GetRequiredService<T>() ?? serviceProvider.GetRequiredService<T>();

    public void Dispose() => scope?.Dispose();
}