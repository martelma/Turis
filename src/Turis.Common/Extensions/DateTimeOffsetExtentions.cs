namespace Turis.Common.Extensions;

public static class DateTimeOffsetExtentions
{
    public static double ToRedisScore(this DateTimeOffset date)
    {
        return date.Subtract(Constants.BaseDate).TotalSeconds;
    }
}