namespace Turis.Authentication.Settings;

public class LockoutSettings
{
    public int MaxFailedAccessAttempts { get; init; }

    public TimeSpan DefaultLockout { get; init; }
}