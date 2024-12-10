namespace Turis.Common.Models.Requests;

public class CopyUserSettingsRequest
{
    public Guid ApplicationId { get; set; }
    public Guid UserSourceId { get; set; }
    public Guid UserTargetId { get; set; }
}
