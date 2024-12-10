namespace Turis.WebApi.Controllers.Base;

[ApiController]
[Route("api/[controller]")]
public class ApiController : ControllerBase
{
	ILogger _logger;
	protected ILogger Logger => _logger ??= HttpContext.RequestServices.GetService<ILogger<ApiController>>();

	protected readonly ApplicationDbContext DbContext;
	protected readonly RedisService RedisService;
	protected readonly IConfiguration Configuration;
	protected readonly IHubContext<NotificationHub, INotificationHub> NotificationHubContext;
	protected readonly IMediator Mediator;

	protected string CurrentEmail => User.FindFirstValue(ClaimTypes.Email);
	protected string CurrentUserName => User.FindFirstValue("UserName");
	protected ApplicationUser CurrentApplicationUser => new UserRepository(DbContext).GetByUserName(CurrentUserName);

	protected bool UserIsAdmin() => User.IsInRole(Constants.RoleAdmin);

	protected ApiController(ApplicationDbContext context,
		RedisService redisService,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IMediator mediator)
	{
		RedisService = redisService;
		DbContext = context;
		NotificationHubContext = notificationHubContext;
		Mediator = mediator;
	}

	protected ActionResult DownloadWorkbook(IWorkbook workbook, string fileName)
	{
		return PrepareExcelBlob(workbook, fileName);
	}

	protected ActionResult PrepareExcelBlob(IWorkbook workbook, string fileName)
	{
		var bos = new ByteArrayOutputStream();
		try
		{
			workbook.Write(bos, true);
		}
		finally
		{
			bos.Close();
		}

		var bytes = bos.ToByteArray();

		var mimeType = "application/vnd.ms-excel";
		return File(bytes, mimeType, fileName);
	}

	protected bool IsValidSheetName(ISheet sheet)
	{
		return !sheet.SheetName.StartsWith("xxx");
	}

	/// <summary>
	/// per il momento funziona solo per per le property "piatte"
	/// </summary>
	/// <typeparam name="T"></typeparam>
	/// <param name="row"></param>
	/// <param name="columnsName"></param>
	/// <returns></returns>
	protected static T PrepareBoxEntity<T>(IRow row, string[] columnsName)
		where T : IApplicationEntity, new()
	{
		var obj = new T();
		var properties = obj.GetType().GetProperties();
		foreach (var propertyInfo in properties)
		{
			if (!propertyInfo.CanWrite)
				continue;

			//manca la gestione dei tipi classi

			if (propertyInfo.HasAttributes<TemplateFieldAttribute>())
			{
				var cellIndex = Array.IndexOf(columnsName, propertyInfo.Name);
				if (cellIndex == -1)
					continue;

				var cell = row.GetCell(cellIndex);
				if (cell == null)
					continue;

				object value = null;
				switch (propertyInfo.PropertyType.Name)
				{
					case nameof(String):
						value = cell.StringCellValue;
						break;
					case nameof(Int16):
						value = Convert.ToInt16(cell.NumericCellValue);
						break;
					case nameof(Int32):
						value = Convert.ToInt32(cell.NumericCellValue);
						break;
					case nameof(Int64):
						value = Convert.ToInt64(cell.NumericCellValue);
						break;
					case nameof(Decimal):
						value = Convert.ToDecimal(cell.NumericCellValue);
						break;
					case nameof(Double):
						value = cell.NumericCellValue;
						break;
					case nameof(Boolean):
						//value = cell.BooleanCellValue;
						//value = cell.StringCellValue.ToLower() == "true";
						value = cell.ReadBooleanValue();
						break;
					case nameof(DateTime):
						value = cell.DateCellValue;
						break;
					case nameof(TimeOnly):
						value = new TimeOnly((cell.DateCellValue).TimeOfDay.Ticks);
						break;
				}

				obj.GetType().GetProperty(propertyInfo.Name)?.SetValue(obj, value);
			}
		}

		return obj;
	}
}
