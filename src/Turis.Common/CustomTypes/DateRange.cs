using System.Globalization;
using Turis.Common.Interfaces;

namespace Turis.Common.CustomTypes;

public class DateRange : IRange<DateTime>
{
    public DateRange(DateTime start, DateTime end)
    {
        Start = start;
        End = end;
    }

    public DateRange(DateTime date, string timeFrom, string timeTo)
    {
        var startTime = DateTime.ParseExact(timeFrom, "HH:mm", CultureInfo.InvariantCulture).TimeOfDay;
        var endTime = DateTime.ParseExact(timeTo, "HH:mm", CultureInfo.InvariantCulture).TimeOfDay;

        Start = date.AddTicks(startTime.Ticks);
        End = date.AddTicks(endTime.Ticks);

        if (endTime < startTime)
        {
            //caso in cui siamo a cavallo di un giorno; quindi non resta che aggiungere un giorno alla data di fine
            End.AddDays(1);
        }
    }

    public DateTime Start { get; }
    public DateTime End { get; }

    public bool Includes(DateTime value)
    {
        return (Start <= value) && (value <= End);
    }

    public bool Includes(IRange<DateTime> range)
    {
        return (Start <= range.Start) && (range.End <= End);
    }
}