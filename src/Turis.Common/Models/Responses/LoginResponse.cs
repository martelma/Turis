namespace Turis.Common.Models.Responses;

public class LoginResponse
{
    public Guid UserId { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string AccessToken { get; set; }

    public string RefreshToken { get; set; }

    public DateTime? TokenExpiration { get; set; }

    public DateTime? RefreshTokenExpiration { get; set; }

    public DateTime? PasswordExpiration { get; set; }

    // Se questa proprietà è valorizzata, significa che la password è scaduta, quindi è obbligatorio cambiarla.
    public string ChangePasswordToken { get; set; }
}
