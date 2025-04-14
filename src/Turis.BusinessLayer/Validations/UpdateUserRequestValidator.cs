using FluentValidation;
using Turis.BusinessLayer.Resources;
using Turis.Common.Models.Requests;

namespace Turis.BusinessLayer.Validations;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(request => request.UserId).NotEmpty().WithMessage(Account.FieldRequired).WithName(Account.UserId);
        RuleFor(request => request.FirstName).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(50).WithMessage(Account.FieldMaxLength).WithName(Account.FirstName);
        RuleFor(request => request.LastName).NotEmpty().WithMessage(Account.FieldRequired).MaximumLength(50).WithMessage(Account.FieldMaxLength).WithName(Account.LastName);
        RuleFor(request => request.Email).NotNull().WithMessage(Account.FieldRequired).MaximumLength(256).WithMessage(Account.FieldMaxLength).EmailAddress().WithMessage(Account.InvalidEmail).WithName(Account.Email);
        //RuleFor(request => request.Roles).NotEmpty().WithMessage(Account.FieldRequired).WithName(Account.Roles);
    }
}
