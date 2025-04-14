namespace Turis.Common.CustomTypes;

public static class DateTimeExtensions
{
	public static List<DateTime> GenerateDaysRange(this DateTime startDate, DateTime endDate)
	{
		if (startDate > endDate)
			throw new ArgumentException("La data di inizio deve essere precedente o uguale alla data di fine.");

		return Enumerable.Range(0, (endDate - startDate).Days + 1)
			.Select(offset => startDate.AddDays(offset))
			.ToList();
	}
}