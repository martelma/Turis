using Turis.BusinessLayer.Services.Base;
using Turis.Common.Mailing;

namespace Turis.BusinessLayer.Services.Interfaces;

public interface IEmailService : IService
{
	Task TestEmailAsync();
	Task SendEmailAsync(string toName, string toEmail, string subject, string body);
	Task SendTemplateEmailAsync<T>(string toName, string toEmail, string subject, string templateName, T model) where T : BaseEmailModel;
}