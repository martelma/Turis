namespace Turis.BusinessLayer.Services.Email;

public class NotificationSettings
{
    public string Schema { get; set; }
    public string Domain { get; set; }
    public string Url { get; set; }
    public string TemplatePath { get; set; }
    public string EMailAdministrator { get; set; }
    public string EMailSupport { get; set; }
    public string EMailTest { get; set; }
    public string SenderName { get; set; }
    public string SenderEmail { get; set; }
}