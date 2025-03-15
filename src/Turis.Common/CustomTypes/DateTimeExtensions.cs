namespace Turis.Common.CustomTypes;

public static class DateTimeExtensions
{
	public static DateTime StartYear(this DateTime dateTime)
	{
		return new DateTime(dateTime.Year, 1, 1);
	}

	public static DateTime StartMonth(this DateTime dateTime)
	{
		return new DateTime(dateTime.Year, dateTime.Month, 1);
	}

	public static DateTime EndMonth(this DateTime dateTime)
	{
		return new DateTime(dateTime.Year, dateTime.Month, DateTime.DaysInMonth(dateTime.Year, dateTime.Month), 23, 59, 59);
	}

	public static DateTime StartWeek(this DateTime dateTime, DayOfWeek startOfWeek = DayOfWeek.Sunday)
	{
		var diff = (7 + (dateTime.DayOfWeek - startOfWeek)) % 7; // Calcola il differenziale
		return dateTime.AddDays(-diff).Date; // Sottrae i giorni necessari e ritorna a mezzanotte
	}

	public static bool IsInRanges(this DateTime dateToCheck, IEnumerable<DateRange> ranges)
	{
		foreach (var exception in ranges)
		{
			if (exception.Includes(dateToCheck))
				return true;
		}

		return false;
	}
	public static List<DateTime> GenerateDaysRange(this DateTime startDate, DateTime endDate)
	{
		if (startDate > endDate)
			throw new ArgumentException("La data di inizio deve essere precedente o uguale alla data di fine.");

		return Enumerable.Range(0, (endDate - startDate).Days + 1)
			.Select(offset => startDate.AddDays(offset))
			.ToList();
	}
}