using FluentValidation;

namespace Turis.BusinessLayer.Validations;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(request => request.OldPassword).NotEmpty().WithMessage(Account.FieldRequired).WithName(Account.OldPassword);
        RuleFor(request => request.NewPassword).Equal(request => request.PasswordConfirmation).WithMessage(Account.NewPasswordCompare);
    }
}
