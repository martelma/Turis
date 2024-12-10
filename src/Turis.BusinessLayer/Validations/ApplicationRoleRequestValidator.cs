using FluentValidation;

namespace Turis.BusinessLayer.Validations;

public class ApplicationRoleRequestValidator : AbstractValidator<ApplicationRole>
{
    public ApplicationRoleRequestValidator()
    {
        RuleFor(request => request.Name).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(256).WithMessage(Account.FieldMaxLength).WithName(Account.Name);
    }
}
