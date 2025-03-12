using OperationResults;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IMailNotificationService
{
    Task<Result> SendEmailAsync(string emailRecipient, string subject, string body);

    Task<Result> SendEmailAsync(string toName, string toEmail, string subject, string templateName, dynamic model);
}