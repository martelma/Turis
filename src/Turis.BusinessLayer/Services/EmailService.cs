using System.Net;
using FluentEmail.Core;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.BusinessLayer.Settings;
using Turis.Common.Mailing;
using Turis.BusinessLayer.Resources;

namespace Turis.BusinessLayer.Services;

public class EmailService(IFluentEmail fluentEmail
	, IOptions<SmtpSettings> smtpSettingsOptions
	, IOptions<NotificationSettings> notificationSettingsOptions
	, IWebHostEnvironment environment
	, ILogger<EmailService> logger) : IEmailService
{
	private readonly SmtpSettings smtpSettings = smtpSettingsOptions.Value;
	private readonly NotificationSettings notificationSettings = notificationSettingsOptions.Value;

	static EmailService()
	{
		ServicePointManager.ServerCertificateValidationCallback = (_, _, _, _) => true;
	}

	public async Task TestEmailAsync()
	{
		var toName = notificationSettings.EMailTest;
		var toEmail = notificationSettings.EMailTest;
		var subject = "Test Email";
		var body = "This is a test email";
		await SendEmailAsync(toName, toEmail, subject, body);
	}

	public async Task SendEmailAsync(string toName, string toEmail, string subject, string body)
	{
		if (environment.IsDevelopment())
		{
			// Durante la fase di test sostituisco al destinatario l'email di test.
			toName = notificationSettings.EMailTest;
			toEmail = notificationSettings.EMailTest;
		}

		try
		{
			var sendResponse = await fluentEmail.To(toEmail, toName).Subject(subject).Body(body).SendAsync();
			if (!sendResponse.Successful)
			{
				logger.LogWarning(Errors.SendEmailError, toEmail, string.Join(", ", sendResponse.ErrorMessages));
			}
		}
		catch (Exception ex)
		{
			logger.LogError(ex, Errors.UnexpectedSendEmailError, toEmail);
		}
	}

	public async Task SendTemplateEmailAsync<T>(string toName, string toEmail, string subject, string templateName, T model)
		where T : BaseEmailModel
	{
		if (environment.IsDevelopment())
		{
			// Durante la fase di test sostituisco al destinatario l'email di test.
			toName = notificationSettings.EMailTest;
			toEmail = notificationSettings.EMailTest;
		}

		try
		{
			var extension = Path.GetExtension(templateName);
			if (!extension.EqualsIgnoreCase(".cshtml"))
			{
				templateName = $"{templateName}.cshtml";
			}

			var templatePath = notificationSettings.TemplatePath;
			if (!Path.IsPathRooted(templatePath))
			{
				templatePath = Path.Combine(environment.WebRootPath, templatePath);
			}

			var templateFullFileName = Path.Combine(templatePath, Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName, templateName);

			// Volendo si potrebbe rendere dinamico anche la scelta del layout della mail in base al tenant o a qualcos'altro
			model.LayoutFullFileName ??= Path.Combine(templatePath, "_EmailLayout.cshtml");
			model.EMailSupport ??= notificationSettings.EMailSupport;

			//var sendResponse = await fluentEmail
			//    .To(toEmail, toName)
			//    .Subject(subject)
			//    .UsingTemplateFromFile(templateFullFileName, model)
			//    .SendAsync();

			var email = fluentEmail
				.To(toEmail, toName)
				.Subject(subject)
				.UsingTemplateFromFile(templateFullFileName, model);
#if DEBUG
			var htmlContent = email.Data.Body;
			var filePath = @"C:\\Temp\emailContent.html";
			await File.WriteAllTextAsync(filePath, htmlContent);
#endif
			var sendResponse = await email.SendAsync();

			if (!sendResponse.Successful)
			{
				logger.LogWarning(Errors.SendEmailError, toEmail, string.Join(", ", sendResponse.ErrorMessages));
			}
		}
		catch (Exception ex)
		{
			logger.LogError(ex, Errors.UnexpectedSendEmailError, toEmail);
		}
	}
}
