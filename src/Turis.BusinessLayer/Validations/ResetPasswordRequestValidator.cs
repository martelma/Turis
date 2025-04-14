using FluentValidation;
using Turis.BusinessLayer.Resources;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Validations;

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(request => request.Password).Equal(request => request.PasswordConfirmation).WithMessage(Account.PasswordCompare);
    }
}
