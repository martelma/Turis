using Turis.Common.Models.Base;

namespace Turis.Common.Models;

public class CollaboratorModel : BaseModel
{
	public string UserName { get; set; }
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public string FullName => $"{FirstName} {LastName}".Trim();
	public string Email { get; set; }
	public string PhoneNumber { get; set; }
	public string Language { get; set; }
	public string AvatarUrl { get; set; }
	public Guid? ContactId { get; set; }
}