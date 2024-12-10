using Microsoft.AspNetCore.Http;

namespace Turis.Common.Extensions;

public static class IFormFileExtentions
{
    public static async void SaveTo(this IFormFile file, string fullFileName)
    {
        await using Stream fileStream = new FileStream(fullFileName, FileMode.Create);
        await file.CopyToAsync(fileStream);
    }
}