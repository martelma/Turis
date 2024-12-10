using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

[Authorize(Roles = Constants.RoleAdmin)]
public class AdminController : ApiController
{
	private readonly IConfiguration _configuration;
	private readonly MailNotificationService _mailNotificationService;

	// The Web API will only accept tokens 1) for users, and 2) having the "access_as_user" scope for this API
	static readonly string[] scopeRequiredByApi = new string[] { "access_as_user" };

	public AdminController(
		ApplicationDbContext context,
		RedisService redisService,
		IConfiguration configuration,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IMediator mediator,
		MailNotificationService mailNotificationService
		) : base(context, redisService, notificationHubContext, mediator)
	{
		_configuration = configuration;
		_mailNotificationService = mailNotificationService;
	}

	[HttpPost]
	[Route("FlushDataBase")]
	public async Task<IActionResult> FlushDataBase()
	{
		await RedisService.FlushDbAsync();
		return Ok();
	}

	[HttpPost]
	[Route("GetHashCode/{value}")]
	public int GetHashCode(string value)
	{
		return value.ToUpper().GetHashCode();
	}

	[HttpPost]
	[Route("TruncateElmah")]
	public IActionResult TruncateElmah()
	{
		var connectionString = _configuration["ConnectionStrings:DefaultConnection"];
		var sqlHelper = new SqlHelper(connectionString);
		sqlHelper.TruncateElmah();
		return Ok();
	}

	//[HttpPost]
	//[Route("InitDrawCode")]
	//public IActionResult InitDrawCode()
	//{
	//	var ids = _serialRepository.List().Where(x => x.DrawCode == null).Select(x => x.Id).ToList();
	//	foreach (var id in ids)
	//	{
	//		var serial = _serialRepository.GetById(id);
	//		var document = _documentRepository.Lookup(serial.DocumentKey)?.ToViewModel(_materialRepository, _documentRepository, _boxProductionRepository);

	//		var drawCode = document.Material.DrawCode;
	//		var drawRevision = _drawService.GetCurrentDrawInfoByDrawCode(serial.Process.DrawingArchive?.Id, drawCode);

	//		serial.DrawCode = drawCode;
	//		serial.DrawRevision = drawRevision;
	//		_serialRepository.Update(serial);
	//	}
	//	return Ok();
	//}

	[HttpGet("BackendConfiguration")]
	public List<KeyValue> BackendConfiguration()
	{
		var list = new List<KeyValue>();

		var defaultConnection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
		list.Add(new KeyValue("DefaultConnection", $"{defaultConnection.DataSource} - {defaultConnection.Database}"));

		var hangfireConnection = new SqlConnection(_configuration.GetConnectionString("HangfireConnection"));
		list.Add(new KeyValue("HangfireConnection", $"{hangfireConnection.DataSource} - {hangfireConnection.Database}"));

		var sSap = new SqlConnection(_configuration.GetConnectionString("S_SAP"));
		list.Add(new KeyValue("S_SAP", $"{sSap.DataSource} - {sSap.Database}"));

		var sBox = new SqlConnection(_configuration.GetConnectionString("S_BOX"));
		list.Add(new KeyValue("S_BOX", $"{sBox.DataSource} - {sBox.Database}"));

		var pdm = new SqlConnection(_configuration.GetConnectionString("PDM"));
		list.Add(new KeyValue("PDM", $"{pdm.DataSource} - {pdm.Database}"));

		list.Add(new KeyValue("Redis", $"{RedisService.ConnectionString} - {RedisService.RedisDbNumber}"));

		list.Add(new KeyValue("Plugin.Path", $"{_configuration["Plugin:Path"]}"));

		list.Add(new KeyValue("pdmApi", $"{_configuration["pdmApi:baseUrl"]}"));

		list.Add(new KeyValue("printApi", $"{_configuration["printApi:baseUrl"]}"));

		list.Add(new KeyValue("sapApi", $"{_configuration["sapApi:baseUrl"]}"));

		return list;
	}

	[AllowAnonymous]
	[HttpGet("SendTestMail")]
	public async Task<IActionResult> SendTestMail()
	{
		await _mailNotificationService.SendEmail("mario", "m.martellini@trigano.it", "Test - SendEmail", "ciao Mario, facciamo una prova");

		return Ok();
	}

	[AllowAnonymous]
	[HttpGet("SendTestMail2")]
	public async Task<IActionResult> SendTestMail2()
	{
		dynamic model = new ExpandoObject();

		model.SectionTitle = "Cart Route Serial - Exception";
		model.SectionSubTitle = "Change Material";
		model.CartBaseCode = "ABC";
		model.CartNumber = 123456;
		//model.SerialCode = item.Code;
		//model.SerialSequenceText = item.Code;
		//model.ProcessCode = process.Code;
		//model.ProcessName = process.Name;
		//model.SegmentCode = segment?.Code;
		//model.SegmentName = segment?.Name;
		//model.WorkPhaseCode = workPhase?.Code;
		//model.WorkPhaseName = workPhase?.Name;
		//model.WorkstationCode = workstation?.Code;
		//model.WorkstationName = workstation?.Name;
		//model.ExceptionCode = item.ExceptionCode;
		//model.ExceptionNote = item.ExceptionNote;
		//model.UserException = item.UserException?.FullName;
		//model.TsException = item.TsException;
		model.MaterialOld = new
		{
			CodeMaterial = "Code Material 1",
			DesMaterial = "Des Material 1",
			UnitOfMeasureCode = "M",
			UnitOfMeasureName = "Metri",
			Quantity = 10
		};
		model.MaterialNew = new
		{
			CodeMaterial = "Code Material 2",
			DesMaterial = "Des Material 2",
			UnitOfMeasureCode = "M2",
			UnitOfMeasureName = "MQuadri",
			Quantity = 20
		};
		model.FirstName = "Mario";
		model.LastName = "Martellini";
		model.Data = new DateTime(2023, 1, 19);
		model.Details = new List<string> { "text1", "text2", "text3", "text4" };
		
		await _mailNotificationService.SendTemplateEmail("mario", "m.martellini@trigano.it", "Test - SendTemplateEmail", "Test", model);

		return Ok();
	}
}

public class KeyValue
{
	public string Key { get; }
	public string Value { get; }

	public KeyValue(string key, string value)
	{
		Key = key;
		Value = value;
	}
}