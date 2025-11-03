namespace Turis.Common.Models.Requests;

public class UpdateUserRequest
{
    public Guid UserId { get; set; }
    public string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Language { get; set; }
    public Guid? ContactId { get; set; }
    public IEnumerable<string> Roles { get; set; } = [];
    public bool IsActive { get; set; } = true;
}
