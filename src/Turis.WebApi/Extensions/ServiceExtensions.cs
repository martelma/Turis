using Microsoft.AspNetCore.Authentication;
using Microsoft.OpenApi.Models;
using SimpleAuthentication;
using TinyHelpers.AspNetCore.Swagger;
using Turis.Authentication.Settings;
using Turis.WebApi.Middlewares;

namespace Turis.WebApi.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration, string sectionName = "AuthenticationSettings")
    {
        services.AddHttpContextAccessor();

        // Enables permission-based authorization.
        services.AddScopePermissions();

        services.Configure<AuthenticationSettings>(configuration.GetSection(sectionName));
        services.AddTransient<IClaimsTransformation, ClaimsNormalizer>();

        return services;
    }

    public static IServiceCollection AddApplicationId(this IServiceCollection services, IConfiguration configuration, Guid? defaultValue = null, string headerName = "AuthenticationSettings:ApplicationIdHeaderName")
    {
        services.AddSwaggerOperationParameters(options =>
        {
            options.Parameters.Add(new()
            {
                Name = configuration.GetValue<string>(headerName),
                In = ParameterLocation.Header,
                Required = true,
                Schema = OpenApiSchemaHelper.CreateSchema("string", "uuid", defaultValue)
            });
        });

        return services;
    }

    public static IApplicationBuilder UseApplicationId(this IApplicationBuilder app)
        => app.UseMiddleware<ApplicationIdMiddleware>();
}
