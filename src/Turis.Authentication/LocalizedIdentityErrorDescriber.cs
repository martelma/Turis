using Microsoft.AspNetCore.Identity;
using Turis.Authentication.Resources;

namespace Turis.Authentication;

public class LocalizedIdentityErrorDescriber : IdentityErrorDescriber
{
    public override IdentityError PasswordRequiresUniqueChars(int uniqueChars)
        => new()
        {
            Code = nameof(PasswordRequiresUniqueChars),
            Description = string.Format(IdentityMessages.PasswordRequiresUniqueChars, uniqueChars)
        };

    public override IdentityError RecoveryCodeRedemptionFailed()
        => new()
        {
            Code = nameof(RecoveryCodeRedemptionFailed),
            Description = IdentityMessages.RecoveryCodeRedemptionFailed
        };

    public override IdentityError UserNotInRole(string role)
        => new()
        {
            Code = nameof(UserNotInRole),
            Description = string.Format(IdentityMessages.UserNotInRole, role)
        };

    public override IdentityError DefaultError()
        => new()
        {
            Code = nameof(DefaultError),
            Description = IdentityMessages.DefaultError
        };

    public override IdentityError ConcurrencyFailure()
        => new()
        {
            Code = nameof(ConcurrencyFailure),
            Description = IdentityMessages.ConcurrencyFailure
        };

    public override IdentityError PasswordMismatch()
        => new()
        {
            Code = nameof(PasswordMismatch),
            Description = IdentityMessages.PasswordMismatch
        };

    public override IdentityError InvalidToken()
        => new()
        {
            Code = nameof(InvalidToken),
            Description = IdentityMessages.InvalidToken
        };

    public override IdentityError LoginAlreadyAssociated()
        => new()
        {
            Code = nameof(LoginAlreadyAssociated),
            Description = IdentityMessages.LoginAlreadyAssociated
        };

    public override IdentityError InvalidUserName(string userName)
        => new()
        {
            Code = nameof(InvalidUserName),
            Description = string.Format(IdentityMessages.InvalidUserName, userName)
        };

    public override IdentityError InvalidEmail(string email)
        => new()
        {
            Code = nameof(InvalidEmail),
            Description = string.Format(IdentityMessages.InvalidEmail, email)
        };

    public override IdentityError DuplicateUserName(string userName)
        => new()
        {
            Code = nameof(DuplicateUserName),
            Description = string.Format(IdentityMessages.DuplicateUserName, userName)
        };

    public override IdentityError DuplicateEmail(string email)
        => new()
        {
            Code = nameof(DuplicateEmail),
            Description = string.Format(IdentityMessages.DuplicateEmail, email)
        };

    public override IdentityError InvalidRoleName(string role)
        => new()
        {
            Code = nameof(InvalidRoleName),
            Description = string.Format(IdentityMessages.InvalidRoleName, role)
        };

    public override IdentityError DuplicateRoleName(string role)
        => new()
        {
            Code = nameof(DuplicateRoleName),
            Description = string.Format(IdentityMessages.DuplicateRoleName, role)
        };

    public override IdentityError UserAlreadyHasPassword()
        => new()
        {
            Code = nameof(UserAlreadyHasPassword),
            Description = IdentityMessages.UserAlreadyHasPassword
        };

    public override IdentityError UserLockoutNotEnabled()
        => new()
        {
            Code = nameof(UserLockoutNotEnabled),
            Description = IdentityMessages.UserLockoutNotEnabled
        };

    public override IdentityError UserAlreadyInRole(string role)
        => new()
        {
            Code = nameof(UserAlreadyInRole),
            Description = string.Format(IdentityMessages.UserAlreadyInRole, role)
        };

    public override IdentityError PasswordTooShort(int length)
        => new()
        {
            Code = nameof(PasswordTooShort),
            Description = string.Format(IdentityMessages.PasswordTooShort, length)
        };

    public override IdentityError PasswordRequiresNonAlphanumeric()
        => new()
        {
            Code = nameof(PasswordRequiresNonAlphanumeric),
            Description = IdentityMessages.PasswordRequiresNonAlphanumeric
        };

    public override IdentityError PasswordRequiresDigit()
        => new()
        {
            Code = nameof(PasswordRequiresDigit),
            Description = IdentityMessages.PasswordRequiresDigit
        };

    public override IdentityError PasswordRequiresLower()
        => new()
        {
            Code = nameof(PasswordRequiresLower),
            Description = IdentityMessages.PasswordRequiresLower
        };

    public override IdentityError PasswordRequiresUpper()
        => new()
        {
            Code = nameof(PasswordRequiresUpper),
            Description = IdentityMessages.PasswordRequiresUpper
        };
}
