using System.ComponentModel.DataAnnotations.Schema;
using JeMa.Shared.Interfaces;

namespace Turis.DataAccessLayer.Entities.Base;

public class BaseEntity: INotificationEntity
{
	public Guid Id { get; set; }

    [NotMapped]
    public string EntityId => Id.ToString();

    [NotMapped]
    public virtual string EntityInfo => string.Empty;
}