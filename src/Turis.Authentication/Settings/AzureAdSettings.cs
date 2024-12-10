namespace Turis.Authentication.Settings;

public class AzureAdSettings
{
    public string Instance { get; init; }

    public string Domain { get; init; }

    public string TenantId { get; init; }

    public string ClientId { get; init; }

    public string[] Scopes { get; init; }

    public const string AzureActiveDirectoryBearer = "AzureActiveDirectoryBearer";
}
