using FluentValidation;

namespace Turis.BusinessLayer.Validations;

public class ApplicationScopeRequestValidator : AbstractValidator<ApplicationScope>
{
    public ApplicationScopeRequestValidator()
    {
        RuleFor(request => request.Name).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(128).WithMessage(Account.FieldMaxLength).WithName(Account.Name);
        RuleFor(request => request.RoleIds).NotEmpty().WithMessage(Account.FieldRequired).WithName(Account.RoleId);
    }
}
