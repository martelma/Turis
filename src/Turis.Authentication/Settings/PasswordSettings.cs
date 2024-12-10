namespace Turis.Authentication.Settings;

public class PasswordSettings
{
    public int ExpirationDays { get; init; }

    public int RequiredLength { get; init; }

    public bool RequireNonAlphanumeric { get; init; }

    public bool RequireLowercase { get; init; }

    public bool RequireUppercase { get; init; }

    public bool RequireDigit { get; init; }
}
