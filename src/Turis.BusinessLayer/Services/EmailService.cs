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
using OperationResults;

namespace Turis.BusinessLayer.Services;

public class EmailService(IFluentEmailFactory fluentEmailFactory
	, ILogger<MailNotificationService> logger
	, IOptions<NotificationSettings> notificationOptions
	, IWebHostEnvironment environment
	) : IEmailService
{
	private readonly NotificationSettings notificationSettings = notificationOptions.Value;

	static EmailService()
    {
        ServicePointManager.ServerCertificateValidationCallback = (_, _, _, _) => true;
    }

	public async Task<Result> SendEmailAsync(string emailRecipient, string subject, string body)
	{
		// Durante la fase di test sostituisco al destinatario l'email di test.
		if (environment.IsDevelopment())
			emailRecipient = notificationSettings.EMailTest;

		try
		{
			var sendResponse = await fluentEmailFactory.Create()
				.To(emailRecipient)
				.Subject(subject)
				.Body(body)
				.SendAsync();

			if (!sendResponse.Successful)
			{
				logger.LogWarning(Errors.SendEmailError, emailRecipient, string.Join(", ", sendResponse.ErrorMessages));
				return Result.Fail(FailureReasons.NetworkError, string.Join(", ", sendResponse.ErrorMessages));
			}

			return Result.Ok();
		}
		catch (Exception ex)
		{
			logger.LogError(ex, Errors.UnexpectedSendEmailError, emailRecipient);
			return Result.Fail(FailureReasons.NetworkError, ex);
		}
	}

	public async Task<Result> SendEmailAsync(string emailRecipient, string subject, string templateName, string language, dynamic model)
	{
		// Durante la fase di test sostituisco al destinatario l'email di test.
		if (environment.IsDevelopment())
			emailRecipient = notificationSettings.EMailTest;

		try
		{
			logger.LogInformation($"Sending email to: {emailRecipient}");

			var extension = Path.GetExtension(templateName);
			if (!extension.EqualsIgnoreCase(".cshtml"))
				templateName = $"{templateName}.cshtml";

			var templatePath = notificationSettings.TemplatePath;
			if (!Path.IsPathRooted(templatePath))
				templatePath = Path.Combine(environment.WebRootPath, templatePath);

			var templateFullFileName = Path.Combine(notificationSettings.TemplatePath, language.IsNotNullOrEmpty() ? language : Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName, templateName);

			// Volendo si potrebbe rendere dinamico anche la scelta del layout della mail in base al tenant o a qualcos'altro
			model.LayoutFullFileName = Path.Combine(notificationSettings.TemplatePath, "_EmailLayout.cshtml");
			model.SupportEmail = notificationSettings.EMailSupport;

			var sendResponse = await fluentEmailFactory.Create()
				.To(emailRecipient)
				.Subject(subject)
				.UsingTemplateFromFile(templateFullFileName, model)
				.SendAsync();

			if (!sendResponse.Successful)
			{
				logger.LogWarning(Errors.SendEmailError, emailRecipient, (string)string.Join(", ", sendResponse.ErrorMessages));
				return Result.Fail(FailureReasons.NetworkError, string.Join(", ", sendResponse.ErrorMessages));
			}

			logger.LogInformation($"Email successfully sent to: {emailRecipient}");

			return Result.Ok();
		}
		catch (Exception ex)
		{
			logger.LogError(ex, Errors.UnexpectedSendEmailError, emailRecipient);
			return Result.Fail(FailureReasons.NetworkError, ex);
		}
	}
}
