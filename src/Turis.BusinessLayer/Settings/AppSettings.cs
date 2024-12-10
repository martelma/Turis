namespace Turis.BusinessLayer.Settings;

public class AppSettings
{
    public string SenderEmail { get; init; }

    public string SenderName { get; init; }

    public string EmailTemplatePath { get; init; }

    public string TestEmailReceiver { get; init; }

    public string SupportEmail { get; init; }

    public string PasswordRecoveryCallbackUrl { get; set; }

    public string ApplicationUrl { get; set; }
}
