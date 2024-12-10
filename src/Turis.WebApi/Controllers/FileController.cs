using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

public class FileController : ApiController
{
	private readonly IFileService _fileService;
	private readonly IAvatarService _avatarService;

	public FileController(
		ApplicationDbContext context,
		RedisService redisService,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IMediator mediator,
		IFileService fileService,
		IAvatarService avatarService
		) : base(context, redisService, notificationHubContext, mediator)
	{
		_fileService = fileService;
		_avatarService = avatarService;
	}

	[HttpGet("DownloadTempFile")]
	public async Task<IActionResult> DownloadTempFile(string fileName)
	{
		if (fileName == "null")
			fileName = string.Empty;

		var content = await _fileService.ReadCdnTemp(fileName);
		if (content != null)
			return File(content, MimeMapping.MimeUtility.GetMimeMapping(fileName));

		return NotFound();
	}

	[AllowAnonymous]
	[HttpGet("AvatarImage/{userId}")]
	public async Task<IActionResult> AvatarImage(string userId)
	{
		var storageFileInfo = await _avatarService.Read(userId);
		if (storageFileInfo != null)
			return File(storageFileInfo.Content, MimeMapping.MimeUtility.GetMimeMapping(storageFileInfo.FileName));

		return NotFound();
	}
}