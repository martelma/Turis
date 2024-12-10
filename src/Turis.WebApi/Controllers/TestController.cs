using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

[AllowAnonymous]
public class TestController : ApiController
{
	private readonly ApplicationDbContext _context;
	private readonly UserManager<ApplicationUser> _userManager;
	private readonly IConfiguration _configuration;

	public TestController(
		ApplicationDbContext context,
		RedisService redisService,
		UserManager<ApplicationUser> userManager,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IConfiguration configuration,
		IMediator mediator) : base(context, redisService, notificationHubContext, mediator)
	{
		_context = context;
		_userManager = userManager;
		_configuration = configuration;
	}

	[HttpGet]
	[AllowAnonymous]
	[Route("ex")]
	public Task<List<SerialViewModel>> ex()
	{
		throw new Exception("siamo nel test di una eccezione; lanciata con throw new Exception");
		//base.Problem("siamo nel test di una eccezione", null, 400, "title di esempio", null);
		//return null;
	}

	//[HttpGet]
	//[AllowAnonymous]
	//[Route("RepaireMachineProgramData")]
	//public async Task<IActionResult> RepaireMachineProgramData()
	//{
	//	var repository = new MachineProgramDataRepository(_context);

	//	var machineProjection = new MachineProjection();
	//	var machines = await machineProjection.LookupListAll();
	//	foreach (var machine in machines)
	//	{
	//		//if(machine.Id!= "98f828aa-9ad3-40df-a476-3f09fccc7cef")
	//		//    continue;

	//		var dateFrom = DateTime.Now.AddMonths(-2);

	//		//1.
	//		var list1 = repository.ListFrom(machine.Id, dateFrom);
	//		foreach (var item in list1)
	//		{
	//			//Fix for WorkshiftId
	//			var workshift = await new CalendarHelper().CurrentMachineWorkshift(item.MachineId, item.Start);
	//			if (item.WorkshiftId != workshift.WorkshiftId)
	//			{
	//				var machineProgramData = repository.GetById(item.Id);
	//				machineProgramData.WorkshiftId = workshift.WorkshiftId;
	//				repository.Update(machineProgramData);
	//			}

	//			//Fix for end date
	//			if (item.End < item.Start)
	//			{
	//				var machineProgramData = repository.GetById(item.Id);
	//				machineProgramData.End = machineProgramData.Start;
	//				repository.Update(machineProgramData);
	//			}
	//		}


	//		//2.
	//		var list2 = repository.ListFrom(machine.Id, dateFrom)
	//			.ToList()
	//			.OrderByDescending(x => x.Start)
	//			.ToArray();

	//		for (var i = 0; i < list2.Length - 1; i++)
	//		{
	//			var item = list2[i];
	//			var itemNext = list2[i + 1];

	//			//double waitingTime = 0;
	//			//if (item.End.HasValue && itemNext.End.HasValue)
	//			//    waitingTime = Math.Abs((item.Start - itemNext.End.Value).TotalSeconds);

	//			if (itemNext.End.HasValue && item.Start < itemNext.End.Value)
	//			{
	//				var machineProgramData = repository.GetById(itemNext.Id);
	//				machineProgramData.End = item.Start;
	//				repository.Update(machineProgramData);
	//			}
	//		}
	//	}

	//	return Ok();
	//}

	/*
	[HttpGet]
	[AllowAnonymous]
	[Route("TestEasyMonitor")]
	public async Task<IActionResult> TestEasyMonitor()
	{
		var list = new List<ExampleData>()
		{
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-14","a734affb-ea49-41a2-a763-3a7ae0b1b6bb"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-13","38475e47-eb31-4b49-b1e4-3bb7a124a9d7"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-13","639ef615-28cc-452f-840b-b499bd81d09f"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-10","0f6c276a-f45d-4b57-b1bc-98db2e00f2d3"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-10","15399e6d-8225-4705-8093-82e8c1306342"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-09","189e14a3-b577-48e3-b9f1-0b1086f512c4"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-09","e0b7aea7-8cd6-47ac-ba19-4031bca9b385"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-08","4cf2674e-5a66-4faa-a5a7-6acd073b69e1"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-08","f9f64558-fd58-47e0-a0cb-d0103edf4025"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-07","a734affb-ea49-41a2-a763-3a7ae0b1b6bb"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-07","a8d07fbe-2474-43e9-8fe7-ef9c688f9c7b"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-06","38475e47-eb31-4b49-b1e4-3bb7a124a9d7"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-06","639ef615-28cc-452f-840b-b499bd81d09f"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-03","0f6c276a-f45d-4b57-b1bc-98db2e00f2d3"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-03","15399e6d-8225-4705-8093-82e8c1306342"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-02","189e14a3-b577-48e3-b9f1-0b1086f512c4"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-01","4cf2674e-5a66-4faa-a5a7-6acd073b69e1"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-02-01","f9f64558-fd58-47e0-a0cb-d0103edf4025"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-31","a734affb-ea49-41a2-a763-3a7ae0b1b6bb"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-31","a8d07fbe-2474-43e9-8fe7-ef9c688f9c7b"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-30","38475e47-eb31-4b49-b1e4-3bb7a124a9d7"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-30","639ef615-28cc-452f-840b-b499bd81d09f"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-27","0f6c276a-f45d-4b57-b1bc-98db2e00f2d3"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-27","15399e6d-8225-4705-8093-82e8c1306342"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-26","189e14a3-b577-48e3-b9f1-0b1086f512c4"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-26","e0b7aea7-8cd6-47ac-ba19-4031bca9b385"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-25","4cf2674e-5a66-4faa-a5a7-6acd073b69e1"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-25","f9f64558-fd58-47e0-a0cb-d0103edf4025"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-24","a734affb-ea49-41a2-a763-3a7ae0b1b6bb"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-24","a8d07fbe-2474-43e9-8fe7-ef9c688f9c7b"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-23","38475e47-eb31-4b49-b1e4-3bb7a124a9d7"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-23","639ef615-28cc-452f-840b-b499bd81d09f"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-20","15399e6d-8225-4705-8093-82e8c1306342"),
			new ("98f828aa-9ad3-40df-a476-3f09fccc7cef","2023-01-19","e0b7aea7-8cd6-47ac-ba19-4031bca9b385"),
		};

		var random = new Random();
		var index = random.Next(list.Count);
		var item = list[index];

		var model = await new MachineDataSummaryProjection().Lookup(item.MachineId, item.WorkshiftDate, item.WorkshiftId);

		await NotificationHubContext.Clients.All.MachineDataSummaryChanged(model);

		return Ok();
	}

	class ExampleData
	{
		private CultureInfo provider = new CultureInfo("it-IT");
		private string format = "yyyy-MM-dd";

		public ExampleData(string machineId, string workshiftDate, string workshiftId)
		{
			MachineId = machineId;
			WorkshiftDate = DateTime.ParseExact(workshiftDate, format, provider);
			WorkshiftId = workshiftId;
		}

		public string MachineId { get; set; }
		public DateTime WorkshiftDate { get; set; }
		public string WorkshiftId { get; set; }
	}
	*/

	//[HttpGet]
	//[AllowAnonymous]
	//[Route("RepaireSerials")]
	//public async Task<IActionResult> RepaireSerials()
	//{
	//	var materialRepository = new ();

	//	var repository = new SerialRepository(_context);
	//	var list = repository.List();
	//	foreach (var serial in list)
	//	{
	//		var material = materialRepository.GetById(serial.CodeMaterial);
	//		if (material != null)
	//		{
	//			serial.TagId = material.Tags.FirstOrDefault()?.Id;
	//			if (serial.TagId.HasValue())
	//				repository.Update(serial);
	//		}
	//	}

	//	return Ok();
	//}

	[HttpGet]
	[AllowAnonymous]
	[Route("SerialCodeInfo")]
	public async Task<SerialCodeInfo> SerialCodeInfo(string serialCode)
	{
		return SerialHelper.Info(serialCode);
	}

	[HttpPost("ResetAdminPassword")]
	public async Task<IActionResult> ResetAdminPassword()
	{
#if DEBUG
		var user = await _userManager.FindByEmailAsync("m.martellini@trigano.it");
		if (user == null)
			return NotFound("Utente non trovato");

		var result = await _userManager.RemovePasswordAsync(user);
		if (!result.Succeeded)
			return BadRequest(result.Errors);

		result = await _userManager.AddPasswordAsync(user, Constants.DefaultPassword);
		if (!result.Succeeded)
			return BadRequest(result.Errors);
#endif
		return Ok();
	}
}