using FluentValidation;
using Turis.Common.Models.Requests;
using Turis.BusinessLayer.Resources;

namespace Turis.BusinessLayer.Validations;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(request => request.UserName).NotEmpty().WithMessage(Account.FieldRequired).WithName(Account.UserName);
    }
}
