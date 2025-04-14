using FluentValidation;
using Turis.BusinessLayer.Resources;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Validations;

public class ApplicationRoleRequestValidator : AbstractValidator<ApplicationRoleRequest>
{
    public ApplicationRoleRequestValidator()
    {
        RuleFor(request => request.Name)
	        .NotEmpty()
	        .WithMessage(Account.FieldRequired)
	        .MaximumLength(256)
	        .WithMessage(Account.FieldMaxLength)
	        .WithName(Account.Name);
    }
}
