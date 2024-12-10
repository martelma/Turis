using FluentValidation;

namespace Turis.BusinessLayer.Validations;

public class ApplicationScopeGroupRequestValidator : AbstractValidator<ApplicationScopeGroup>
{
    public ApplicationScopeGroupRequestValidator()
    {
        RuleFor(request => request.Name).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(128).WithMessage(Account.FieldMaxLength).WithName(Account.Name);
    }
}
