using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Turis.Authentication.Entities;

	public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string AvatarUrl { get; set; }
    public DateTime? PasswordExpiration { get; set; }
    public string Language { get; set; }

    public Guid? ContactId { get; set; }

	public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }

    [NotMapped]
	public string FullName => $"{FirstName} {LastName}".Trim();
}
