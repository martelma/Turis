namespace Turis.BusinessLayer.Services.Email;

public class Notification
{
    public string TemplatePath { get; set; }
    public string EMailAdministrator { get; set; }
    public string EMailSupport { get; set; }
    public string EMailTest { get; set; }
    public string SenderName { get; set; }
    public string SenderEmail { get; set; }
}