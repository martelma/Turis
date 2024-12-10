namespace Turis.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobController : ControllerBase
{
	private readonly IBackgroundJobClient _backgroundJobClient;
	private readonly JobProjection _jobProjection;

	public JobController(IBackgroundJobClient backgroundJobClient,
		JobProjection jobProjection)
	{
		_backgroundJobClient = backgroundJobClient;
		_jobProjection = jobProjection;
	}

	[Authorize(Roles = Constants.RoleAdmin)]
	[HttpPost("TruncateJobs")]
	public async Task<IActionResult> TruncateJobs()
	{
		var inProgressJobs = _jobProjection.LookupAll().ToList();
		foreach (var job in inProgressJobs)
			_backgroundJobClient.Delete(job.JobId);

		await _jobProjection.Clear();

		return Ok();
	}

	[HttpGet("InProgressJobs")]
	public async Task<IEnumerable<JobInfo>> InProgressJobs()
	{
		var inProgressJobs = _jobProjection.LookupAll().ToList();
		return inProgressJobs;
	}

	[HttpDelete("{correlationId}")]
	public async Task AbortJob(string correlationId)
	{
		var jobInfo = _jobProjection.Lookup(correlationId);
		_backgroundJobClient.Delete(jobInfo.JobId);
	}
}