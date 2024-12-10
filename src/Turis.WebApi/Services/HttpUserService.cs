namespace Turis.WebApi.Services;

public class HttpUserService : IUserService
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public HttpUserService(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }
    public string GetUserId() => httpContextAccessor.HttpContext.User.GetId();
    public string GetUserName() => httpContextAccessor.HttpContext.User.Identity.Name;
}