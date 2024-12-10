using System.Diagnostics;

namespace Turis.Common.Helpers;

public static class StopwatchHelper
{
	public static async Task<TimeSpan> ExecuteAsync(Func<Task> action)
	{
		var watch = Stopwatch.StartNew();

		await action.Invoke();

		watch.Stop();
		return watch.Elapsed;
	}
}