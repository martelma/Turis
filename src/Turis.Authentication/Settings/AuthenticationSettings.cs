namespace Turis.Authentication.Settings;

public class AuthenticationSettings
{
	public string ApplicationIdHeaderName { get; init; } = "X-Application-Id";

	public Guid ApplicationId { get; init; }

	public TimeSpan RefreshTokenExpirationTime { get; init; }

	public PasswordSettings Password { get; init; }

	public LockoutSettings Lockout { get; init; }

	public TimeSpan OtpExpirationTime { get; init; }
}
