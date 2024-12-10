using Microsoft.AspNetCore.Authorization;

namespace Turis.Authentication.Handlers;

public class ApplicationRequirement(Guid applicationId) : IAuthorizationRequirement
{
    public Guid ApplicationId { get; } = applicationId;
}
