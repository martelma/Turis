using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Turis.Common.Services;

public class ScopedServiceProviderAccessor
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly IServiceProvider serviceProvider;

    public ScopedServiceProviderAccessor(IHttpContextAccessor httpContextAccessor, IServiceProvider serviceProvider)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.serviceProvider = serviceProvider;
    }

    public ScopedServiceProvider GetCurrent()
    {
        // If an HttpContext exists, returns the current scoped ServiceProvider.
        if (httpContextAccessor.HttpContext is not null)
        {
            return new ScopedServiceProvider(httpContextAccessor.HttpContext.RequestServices);
        }

        // Otherwise, creates a new scoped ServiceProvider, that must be explicitly disposed at the end.
        return new ScopedServiceProvider(serviceProvider.CreateScope());
    }
}