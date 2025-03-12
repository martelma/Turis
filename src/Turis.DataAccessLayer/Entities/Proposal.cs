using Turis.Common.Enums;
using Turis.DataAccessLayer.Entities.Base;

namespace Turis.DataAccessLayer.Entities;

public class Proposal : BaseEntity
{
	public Guid ServiceId { get; set; }
	public Service Service { get; set; }
	public Guid CollaboratorId { get; set; }
	public Contact Collaborator { get; set; }
	public DateTime SendDate { get; set; }
	public DateTime? ResponseDate { get; set; }
	public ResponseStatusType? ResponseStatus { get; set; }
}