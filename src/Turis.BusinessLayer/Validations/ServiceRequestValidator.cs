using FluentValidation;
using Turis.BusinessLayer.Resources;
using Turis.Common.Models;
using Turis.DataAccessLayer.Entities;

namespace Turis.BusinessLayer.Validations;

public class ServiceRequestValidator : AbstractValidator<ServiceRequest>
{
	public ServiceRequestValidator()
	{
		//RuleFor(request => request.UserId)
		//	.NotEmpty()
		//	.WithMessage(Account.FieldRequired)
		//	.WithName(Account.UserId);
		RuleFor(request => request.Code)
			.NotEmpty()
			.WithMessage(Account.FieldRequired)
			.MaximumLength(10)
			.WithMessage(Account.FieldMaxLength)
			.WithName(Resources.Service.Code);
		RuleFor(request => request.Title)
			.NotEmpty()
			.WithMessage(Account.FieldRequired)
			.MaximumLength(50)
			.WithMessage(Account.FieldMaxLength)
			.WithName(Resources.Service.Title);
		RuleFor(request => request.Date)
			.NotNull()
			.WithMessage(Account.FieldRequired)
			.WithName(Resources.Service.Date);
		RuleFor(request => request.Location)
			.NotEmpty()
			.WithMessage(Account.FieldRequired)
			.MaximumLength(250)
			.WithMessage(Account.FieldMaxLength)
			.WithName(Resources.Service.Location);
	}
}