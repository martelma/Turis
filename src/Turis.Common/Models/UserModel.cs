using Turis.Common.Enums;
using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class UserModel : BaseModel
{
	public string UserName { get; set; }
	public string Email { get; set; }
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public string FullName => $"{FirstName} {LastName}".Trim();
	public string Avatar { get; set; }
	public bool IsActive { get; set; }
	public AccountType AccountType { get; set; }
	public string Language { get; set; }
	public Guid? ContactId { get; set; }

	public IEnumerable<ApplicationModel> Applications { get; set; } = [];
	public IEnumerable<string> Roles { get; set; } = [];
	public IEnumerable<string> Scopes { get; set; } = [];
}