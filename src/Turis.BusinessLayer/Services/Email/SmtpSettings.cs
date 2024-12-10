using MailKit.Security;

namespace Turis.BusinessLayer.Services.Email;

public class SmtpSettings
{
	public string Host { get; set; }
	public int Port { get; set; }
	public bool UseSsl { get; set; }
	public bool RequiresAuthentication { get; set; }
	public string Username { get; set; }
	public string Password { get; set; }
	public SecureSocketOptions? SocketOptions { get; set; }
}