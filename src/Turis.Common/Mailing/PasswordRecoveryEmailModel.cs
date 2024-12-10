namespace Turis.Common.Mailing;

public class PasswordRecoveryEmailModel : BaseEmailModel
{
    public string FirstName { get; set; }

    public string PasswordRecoveryCode { get; set; }

    public string CallbackUrl { get; set; }
}
