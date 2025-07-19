using FluentEmail.Core;
using FluentEmail.Core.Models;
using Microsoft.Extensions.Options;
using System.Text;
using Turis.BusinessLayer.Settings;

namespace Turis.BusinessLayer.Services.Email;

public class FileSaveSender(IOptions<NotificationSettings> notificationOptions) : FluentEmail.Core.Interfaces.ISender
{
	private readonly NotificationSettings notificationSettings = notificationOptions.Value;

	public SendResponse Send(IFluentEmail email, CancellationToken? token = null)
	{
		return SendAsync(email, token).Result;
	}

	public async Task<SendResponse> SendAsync(IFluentEmail email, CancellationToken? token = null)
	{
		try
		{
			var fileName = $"email_{DateTime.Now:yyyyMMdd_HHmmss}_{Guid.NewGuid().ToString("N")[..8]}.html";
			var filePath = Path.Combine(notificationSettings.MailDebugPath, fileName);

			Directory.CreateDirectory(notificationSettings.MailDebugPath);

			// Crea HTML completo
			var fullHtml = $@"<!DOCTYPE html>
				<html lang=""it"">
				<head>
					<meta charset=""UTF-8"">
					<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
					<title>{email.Data.Subject}</title>
					<meta name=""email-from"" content=""{email.Data.FromAddress?.EmailAddress}"">
					<meta name=""email-to"" content=""{string.Join(", ", email.Data.ToAddresses?.Select(x => x.EmailAddress) ?? [])}"">
					<meta name=""generated-date"" content=""{DateTime.Now:yyyy-MM-dd HH:mm:ss}"">
					<style>
						body {{ 
							font-family: 'Segoe UI', Arial, sans-serif; 
							margin: 0; 
							padding: 20px;
							background-color: #f5f5f5;
						}}
						.email-container {{ 
							max-width: 600px; 
							margin: 0 auto;
							background-color: white;
							padding: 20px;
							border-radius: 8px;
							box-shadow: 0 2px 10px rgba(0,0,0,0.1);
						}}
					</style>
				</head>
				<body>
					<div class=""email-container"">
						{email.Data.Body}
					</div>
				</body>
				</html>";

			await File.WriteAllTextAsync(filePath, fullHtml, Encoding.UTF8);

			Console.WriteLine($@"Email salvata in: {filePath}");

			return new SendResponse();
		}
		catch (Exception ex)
		{
			return new SendResponse
			{
				ErrorMessages = new[] { ex.Message }
			};
		}
	}
}