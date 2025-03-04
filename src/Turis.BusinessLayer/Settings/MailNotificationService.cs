using System.Net;
using FluentEmail.Core;
using FluentEmail.Core.Models;
using JeMa.Shared.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Turis.BusinessLayer.Settings;

public class MailNotificationService
{
	private readonly NotificationSettings _notificationSettings;
	private readonly IFluentEmail _fluentEmail;
	private readonly ILogger<MailNotificationService> _logger;

	public MailNotificationService(IOptions<NotificationSettings> notificationSettings, IFluentEmail fluentEmail, ILogger<MailNotificationService> logger)
	{
		_notificationSettings = notificationSettings.Value;
		_fluentEmail = fluentEmail;
		_logger = logger;

		ServicePointManager.ServerCertificateValidationCallback = (s, c, h, e) => true;
	}

	public async Task SendEmail(string toName, string toMail, string subject, string body)
	{
#if DEBUG
		//durante la fase di test sostituisco al destinatario l'mail di test
		toName = _notificationSettings.EMailTest;
		toMail = _notificationSettings.EMailTest;
#endif
		var sendResponse = await _fluentEmail.To(toMail, toName).Subject(subject).Body(body).SendAsync();
		if (!sendResponse.Successful)
		{
			_logger.LogWarning("E' stato impossibile inviare la mail a: {toMail}; per le seguenti cause: {ErrorMessages}", toMail, sendResponse.ErrorMessages?.ToCSV());
		}
	}

	/// <summary>
	/// Send E-Mail with specific template
	/// </summary>
	/// <param name="toName"></param>
	/// <param name="toMail"></param>
	/// <param name="subject"></param>
	/// <param name="templateName">the name of template (with or without .cshtml)</param>
	/// <param name="model">dynamic object with the parameters for the email template. note: dynamic model = new ExpandoObject();</param>
	/// <returns></returns>
	public async Task SendTemplateEmail(string toName, string toMail, string subject, string templateName, dynamic model)
	{
#if DEBUG
		//durante la fase di test sostituisco al destinatario l'mail di test
		toName = _notificationSettings.EMailTest;
		toMail = _notificationSettings.EMailTest;
#endif

		var ext = new FileInfo(templateName).Extension.ToLower();
		if (ext != ".cshtml")
			templateName = $"{templateName}.cshtml";
		var templateFullFileName = Path.Combine(_notificationSettings.TemplatePath, templateName);

		//volendo si potrebbe rendere dinamico anche la scelta del layout della mail in base al tenant o a qualcos'altro
		model.LayoutFullFileName = Path.Combine(_notificationSettings.TemplatePath, "_EmailLayout.cshtml");

		SendResponse sendResponse = await _fluentEmail
			.To(toMail, toName)
			.Subject(subject)
			.UsingTemplateFromFile(templateFullFileName, model)
			.SendAsync();

		if (!sendResponse.Successful)
		{
			_logger.LogWarning("E' stato impossibile inviare la mail a: {toMail}; per le seguenti cause: {ErrorMessages}", toMail, sendResponse.ErrorMessages?.ToCSV());
		}
	}

	string GetTemplate(string templateName)
	{
		return File.ReadAllText(Path.Combine(_notificationSettings.TemplatePath, templateName));
	}

	/*
	public async Task SendRecoveryPassword(ApplicationUser user, string callbackUrl)
	{
		var model = new
		{
			FirstName = user.FirstName,
			LastName = user.LastName,
			FullName = user.FullName,
			RecoveryPasswordCode = user.RecoveryPasswordCode,
			EMailSupport = _notificationSettings.EMailSupport,
			Callbackurl = callbackUrl
		};

		await SendTemplateEmail(user.FullName, user.Email, "Recovery Password", "RecoveryPassword", model);
	}
	*/
}
