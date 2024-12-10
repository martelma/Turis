using FluentValidation;

namespace Turis.BusinessLayer.Validations;

public class SaveApplicationRequestValidator : AbstractValidator<SaveApplicationRequest>
{
    public SaveApplicationRequestValidator()
    {
        RuleFor(request => request.Name).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(128).WithMessage(Account.FieldMaxLength).WithName(Account.ApplicationName);
        RuleFor(request => request.Url).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(255).WithMessage(Account.FieldMaxLength).WithName(Account.ApplicationUrl);
        RuleFor(request => request.Icon).MaximumLength(255).WithMessage(Account.FieldMaxLength).WithName(Account.ApplicationIcon);
    }
}
