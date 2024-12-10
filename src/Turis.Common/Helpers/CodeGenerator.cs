namespace Turis.Common.Helpers;

public class CodeGenerator
{
    private static Random random = new Random();

    public static string RandomString(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return RandomString(length, chars);
    }

    public static string RandomNumbersString(int length)
    {
        const string chars = "0123456789";
        return RandomString(length, chars);
    }

    public static string RandomString(int length, string chars)
    {
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}