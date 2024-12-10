namespace Turis.Common.Models.Requests;

public class ResetPasswordRequest
{
    public Guid UserId { get; set; }

    public string Token { get; set; }

    public string Password { get; set; }

    public string PasswordConfirmation { get; set; }
}
