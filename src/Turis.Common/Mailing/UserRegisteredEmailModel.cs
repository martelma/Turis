namespace Turis.Common.Mailing;

public class UserRegisteredEmailModel : BaseEmailModel
{
    public string FirstName { get; set; }

    public string TemporaryPassword { get; set; }

    public string CallbackUrl { get; set; }
}
