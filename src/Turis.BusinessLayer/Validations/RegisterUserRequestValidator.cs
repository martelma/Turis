using FluentValidation;
using Turis.BusinessLayer.Resources;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Validations;

public class RegisterUserRequestValidator : AbstractValidator<RegisterUserRequest>
{
    public RegisterUserRequestValidator()
    {
        RuleFor(request => request.UserName).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(256).WithMessage(Account.FieldMaxLength).WithName(Account.UserName);
        RuleFor(request => request.FirstName).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(50).WithMessage(Account.FieldMaxLength).WithName(Account.FirstName);
        RuleFor(request => request.LastName).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(50).WithMessage(Account.FieldMaxLength).WithName(Account.LastName);
        RuleFor(request => request.Email).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(256).WithMessage(Account.FieldMaxLength).EmailAddress().WithMessage(Account.InvalidEmail).WithName(Account.Email);
        //RuleFor(request => request.Password).Equal(request => request.PasswordConfirmation).WithMessage(Account.PasswordCompare);
        // TODO: To activate this in the future
        //RuleFor(request => request.Roles).NotEmpty().WithMessage(Account.FieldRequired).WithName(Account.Roles);
    }
}
