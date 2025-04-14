using FluentValidation;
using Turis.BusinessLayer.Resources;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Validations;

public class ApplicationScopeRequestValidator : AbstractValidator<ApplicationScopeRequest>
{
    public ApplicationScopeRequestValidator()
    {
        RuleFor(request => request.Name)
	        .NotEmpty()
	        .WithMessage(Account.FieldRequired)
	        .MaximumLength(128)
	        .WithMessage(Account.FieldMaxLength)
	        .WithName(Account.Name);
    }
}
