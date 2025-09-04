namespace Turis.Common.Hubs;

public interface INotificationHub
{
	Task Progress(ProgressInfo progressInfo);
	Task Message(Message message);
	Task TaskCompleted(TaskCompletedMessage taskCompletedMessage);


	Task DisplayMessage(string message);
	Task ProgressPercentage(double percentage);
	Task ProgressMessage(string message);
	Task DisplayMessage2(string message);
	Task ProgressPercentage2(double percentage);
	Task ProgressMessage2(string message);

	Task CompletedMessage(string message);

	Task AcceptProposal(Guid serviceId);
	Task RejectProposal(Guid serviceId);
}

public class ProgressInfo
{
	public ProgressInfo()
	{

	}

	public ProgressInfo(string userName, string correlationKey, string correlationId = null, string customKey1 = null, string customKey2 = null, string customKey3 = null)
	{
		UserName = userName;
		CorrelationKey = correlationKey;
		CorrelationId = correlationId;

		CustomKey1 = customKey1;
		CustomKey2 = customKey2;
		CustomKey3 = customKey3;
	}

	public string UserName { get; set; }
	public string CorrelationKey { get; set; }
	public string CorrelationId { get; set; }

	public string CustomKey1 { get; set; }
	public string CustomKey2 { get; set; }
	public string CustomKey3 { get; set; }

	public string DisplayMessage1 { get; set; }
	public double ProgressPercentage1 { get; set; }
	public string ProgressMessage1 { get; set; }
	public string DisplayMessage2 { get; set; }
	public double ProgressPercentage2 { get; set; }
	public string ProgressMessage2 { get; set; }

	public void SetMessage1(string message)
	{
		DisplayMessage1 = message;
	}

	public void SetMessage1(string message, int index, int count)
	{
		DisplayMessage1 = message;
		ProgressPercentage1 = Percentage(index, count);
		ProgressMessage1 = $"{index}/{count}";
	}

	public void SetMessage2(string message)
	{
		DisplayMessage2 = message;
		ProgressPercentage2 = 0;
		ProgressMessage2 = string.Empty;
	}

	public void SetMessage2(string message, int index, int count)
	{
		DisplayMessage2 = message;
		ProgressPercentage2 = Percentage(index, count);
		ProgressMessage2 = $"{index}/{count}";
	}

	public static double Percentage(int index, int steps) => (((double)index / (double)steps) * 100);
}

public record SignalRMessage
{
	public string UserName { get; set; }
	public string CorrelationKey { get; set; }
	public string CorrelationId { get; set; }
}

[Serializable]
public record Message : SignalRMessage
{
	public string Content { get; set; }
}

[Serializable]
public record TaskCompletedMessage : SignalRMessage
{
	public string Status { get; set; }
	public string Message { get; set; }
	public object Data { get; set; }
}

