namespace Turis.Common.CustomAttributes;

public class TemplateFieldAttribute : Attribute
{
    public TemplateFieldAttribute()
    {
			
    }

    public TemplateFieldAttribute(string description, string note = null)
    {
        Description = description;
        Note = note;
    }

    public TemplateFieldAttribute(string[] foreignField, string description, string note = null)
    {
        ForeignField = foreignField;
        Description = description;
        Note = note;
    }

    public string[] ForeignField { get; }
    public string Description { get; set; }
    public string Note { get; set; }
}