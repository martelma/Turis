namespace Turis.Common.Models.Requests;

public class SaveApplicationRequest
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public string Icon { get; set; }

    public int ViewOrder { get; set; }

    public string Url { get; set; }
}
