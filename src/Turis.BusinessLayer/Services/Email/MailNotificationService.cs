using FluentEmail.Core;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OperationResults;
using System.Net;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Extensions;
using Turis.BusinessLayer.Resources;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.BusinessLayer.Settings;
using Turis.DataAccessLayer.Entities;
using Service = Turis.DataAccessLayer.Entities.Service;

namespace Turis.BusinessLayer.Services.Email;

public class MailNotificationService(IFluentEmailFactory fluentEmailFactory
	, ILogger<MailNotificationService> logger
	, IOptions<NotificationSettings> notificationOptions
	, FileSaveSender fileSaveSender
	, IWebHostEnvironment environment
	) : IMailNotificationService
{
	private readonly NotificationSettings notificationSettings = notificationOptions.Value;

	static MailNotificationService()
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
		if (notificationSettings.DebugMode)
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
			model.EMailSupport = notificationSettings.EMailSupport;

			var email = fluentEmailFactory.Create()
				.SetFrom(notificationSettings.SenderEmail, notificationSettings.SenderName)
				.To(emailRecipient)
				.Subject(subject)
				.UsingTemplateFromFile(templateFullFileName, model);

			if (notificationSettings.SaveToFile)
			{
				email.Data.Headers["template"] = templateName;
				await fileSaveSender.SendAsync(email);
			}
			else
			{
				var sendResponse = await email.SendAsync();

				if (!sendResponse.Successful)
				{
					var message = (string)string.Join(", ", sendResponse.ErrorMessages);
					logger.LogWarning(Errors.SendEmailError, emailRecipient, message);
					return Result.Fail(FailureReasons.NetworkError, message);
				}
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

	public async Task SendMailProposal(Service service, Contact collaborator)
	{
		var model = await service.ToProposalEmailModelAsync();

		model.FeedbackUrl = $"{notificationSettings.Url}/collaborator/feedback/{service.Id}";

		await SendEmailAsync(collaborator.FullName, collaborator.EMail, "Proposal", null, model);
	}

	public async Task SendMailAcceptProposal(Service service, Contact collaborator)
	{
		var model = await service.ToProposalEmailModelAsync();

		await SendEmailAsync(collaborator.FullName, collaborator.EMail, "Accept-Proposal", null, model);
	}

	public async Task SendMailRejectProposal(Service service, Contact collaborator)
	{
		var model = await service.ToProposalEmailModelAsync();

		await SendEmailAsync(collaborator.FullName, collaborator.EMail, "Reject-Proposal", null, model);
	}
}
