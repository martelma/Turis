using JeMa.Shared.AspNetCore;
using Microsoft.Extensions.Options;
using TinyHelpers.Extensions;
using Turis.Authentication.Settings;

namespace Turis.WebApi.Middlewares;

public class ApplicationIdMiddleware(RequestDelegate next, IOptions<AuthenticationSettings> authenticationSettingsOptions)
{
    private readonly AuthenticationSettings authenticationSettings = authenticationSettingsOptions.Value;

    public async Task InvokeAsync(HttpContext context)
    {
        var applicationId = context.Request.Headers[authenticationSettings.ApplicationIdHeaderName].FirstOrDefault();
        if (applicationId is null
            || !applicationId.EqualsIgnoreCase(authenticationSettings.ApplicationId?.ToString())
            || (context.User.Identity.IsAuthenticated
                && !context.User.Claims.Any(x => x.Type == ClaimNames.Application && x.Value.EqualsIgnoreCase(applicationId))))
        {
            // L'ApplicationId contenuto nell'Header deve essere uguale al valore contenuto nell'appsettings.json.
            // Inoltre, se l'utente è autenticato, deve possedere il claim Application con lo stesso valore (serve per verificare che l'utente abbia
            // effettivamente i permessi per accedere all'applicazione, perché potrebbe essere un utente autenticato che però non ha diritti
            // sull'applicazione corrente).
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return;
        }

        await next(context);
    }
}