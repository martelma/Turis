using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

public class SearchController : ApiController
{

	public SearchController(
		ApplicationDbContext context,
		RedisService redisService,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IMediator mediator) : base(context, redisService, notificationHubContext, mediator)
	{
	}

	/*
	[HttpGet("{pattern}")]
	public async Task<SearchInfoViewModel> Info(string pattern)
	{
		SearchInfoViewModel result = null;
		var exp = "^C[0-9]{9}";

		var regex = new Regex(exp);

		if (regex.IsMatch(pattern))
		{
			//siamo nel caso in cui il pattern di input corrisponde al formato di un codice carrello
			var number = Convert.ToInt64(pattern.TrimStart('C'));
			var cartRoutes = _cartRouteRepository.ListByNumber(number);
			if (cartRoutes != null)
			{
				result = new SearchInfoViewModel(pattern)
				{
					CartRoutes = cartRoutes.ToViewModel(_drawService, _materialRepository, _documentRepository, _boxProductionRepository)
				};
				return result;
			}
		}


		var searchPattern = $"*{pattern}*";
		result = new SearchInfoViewModel(searchPattern);

		var patternKey = $"{Constants.PrefixEntityKey}:*";  //"box:obj:*"
		var hashKeys = RedisService.RedisServer
			.Keys(-1, pattern: patternKey ?? "*")
			.ToList();

		foreach (var hashKey in hashKeys)
		{
			var hashEntries = RedisService.RedisDb.HashScan(hashKey, searchPattern).ToList();
			if (hashEntries.Count <= 0)
				continue;

			if (hashKey == $"{Constants.PrefixEntityKey}:Document")
				result.Documents.AddRange(hashEntries.Select(hashEntry => hashEntry.Value.ToObject<Document>().ToViewModel(_materialRepository,_documentRepository,_boxProductionRepository)).ToList());

			if (hashKey == $"{Constants.PrefixEntityKey}:Material")
				result.Materials.AddRange(hashEntries.Select(hashEntry => hashEntry.Value.ToObject<Material>().ToViewModel(_tagRepository)).ToList());

			if (hashKey == $"{Constants.PrefixEntityKey}:Drawing")
			{
				var drawings = hashEntries.Select(hashEntry => hashEntry.Value.ToObject<Drawing>())
					.ToList()
					.OrderBy(x => x.DrawCode)
					.ThenBy(x => x.RevisionLetter);
				result.Drawings.AddRange(drawings);
			}
		}

		var serial = _serialRepository.GetByCode(pattern);
		if (serial != null)
		{
			result.Serials.Add(serial.ToViewModel(_materialRepository, _documentRepository, _boxProductionRepository));

			//estraggo anche tutti i SerialMaterialCode
			var serialMaterials = _serialMaterialRepository
				.List(serial.Id)
				.Where(x => x.CodeCart.HasValue());
			result.SerialMaterials.AddRange(serialMaterials.ToViewModel(_documentRepository));
		}
		else
		{
			var serialMaterial = _serialMaterialRepository.GetByCode(pattern);
			if (serialMaterial != null)
			{
				result.SerialMaterials.Add(serialMaterial.ToViewModel(_documentRepository));
				result.Serials.Add(serialMaterial.Serial.ToViewModel(_materialRepository, _documentRepository, _boxProductionRepository));
			}
		}

		return result;
	}

	[HttpGet("Serial/{serialCode}")]
	public SerialViewModel Serial(string serialCode)
	{
		var serial = _serialRepository.GetByCode(serialCode);
		return serial.ToViewModel(_materialRepository, _documentRepository, _boxProductionRepository);
	}

	[HttpGet("SerialHistory/{serialCode}")]
	public SerialHistoryViewModel SerialHistory(string serialCode)
	{
		var serial = _serialRepository.SerialHistory(serialCode);
		var model = serial.ToViewModel(_materialRepository, _documentRepository, _boxProductionRepository);
		return new SerialHistoryViewModel(serial, model);
	}

	[HttpGet("BatchHistory/{processId}/{batch}")]
	public BatchHistoryViewModel BatchHistory(string processId, string batch)
	{
		var process = _processRepository.GetById(processId);
		var serials = _serialRepository.ListByBatch(process, batch);
		var cartRoutes = _cartRouteRepository.ListBySerials(serials?.Select(x => x.Id));

		return new BatchHistoryViewModel
		{
			Serials = serials.ToPlanningSerialViewModel(_materialRepository, _documentRepository, _boxProductionRepository),
			Carts = cartRoutes.ToCartRouteLiteViewModel(_drawService)
		};
	}
	*/
}

/*
public class SerialHistoryViewModel
{
	public SerialHistoryViewModel(Serial serial, SerialViewModel model)
	{
		Serial = model;

		var carts = serial.CartRouteSerials?
			.Select(x => x.CartRoute)
			.Where(x => x.TsOpen > DateTime.MinValue)
			.OrderBy(x => x.TsOpen);
		//.ThenBy(x => x.CartRouteSerials.Where(y => y.TsDone > DateTime.MinValue)?.Min(y => y.TsDone));

		if (carts == null)
			return;

		var det = new SerialHistoryDetailViewModel();
		var currentWorkstation = new SerialHistoryWorkstationViewModel();
		var currentWorkPhase = new SerialHistoryWorkPhaseViewModel();
		var currentCart = new SerialHistoryCartViewModel();

		var lastWorkstationId = string.Empty;
		var lastWorkPhaseId = string.Empty;
		var lastcartId = string.Empty;

		foreach (var cart in carts)
		{
			var cartRouteSerial = cart.CartRouteSerials.FirstOrDefault(x => x.Serial.Id == serial.Id);

			if (cart.WorkPhase.Workstation.Id != lastWorkstationId)
			{
				currentWorkstation = new SerialHistoryWorkstationViewModel
				{
					WorkstationId = cart.WorkPhase.Workstation.Id,
					WorkstationCode = cart.WorkPhase.Workstation.Code,
					WorkstationName = cart.WorkPhase.Workstation.Name,
				};
				det = new SerialHistoryDetailViewModel
				{
					SerialHistoryWorkstation = currentWorkstation,
				};
				History.Add(det);

				lastWorkstationId = cart.WorkPhase.Workstation.Id;
			}

			if (cart.WorkPhase.Id != lastWorkPhaseId)
			{
				currentWorkPhase = new SerialHistoryWorkPhaseViewModel
				{
					WorkPhaseId = cart.WorkPhase.Id,
					WorkPhaseCode = cart.WorkPhase.Code,
					WorkPhaseName = cart.WorkPhase.Name,
					WorkPhaseFlowType = cart.WorkPhase.FlowType.ToString()
				};
				currentWorkstation.SerialHistoryWorkPhases.Add(currentWorkPhase);
				lastWorkPhaseId = cart.WorkPhase.Id;
			}

			if (cart.Id != lastcartId)
			{
				currentCart = new SerialHistoryCartViewModel
				{
					CartId = cart.Id,
					CartCode = cart.Cart.CartBase.Code,
					CartNumber = cart.Cart.Number,

					CartOpenBy = cart.UserOpen?.FullName,
					CartOpenAt = cart.TsOpen,
					CartCloseBy = cart.UserClose?.FullName,
					CartCloseAt = cart.TsClose,

					SerialDoneBy = cartRouteSerial?.UserDone?.FullName,
					SerialDoneAt = cartRouteSerial?.TsDone ?? DateTime.MinValue,

					SerialProductionDeclarationBy = cartRouteSerial?.UserProductionDeclaration?.FullName,
					SerialProductionDeclarationAt = cartRouteSerial?.TsProductionDeclaration ?? DateTime.MinValue,
				};
				currentWorkPhase.SerialHistoryCarts.Add(currentCart);
				lastcartId = cart.Id;
			}
		}
	}

	public SerialViewModel Serial { get; set; }
	public List<SerialHistoryDetailViewModel> History { get; set; } = new();

	public class SerialHistoryDetailViewModel
	{
		public SerialHistoryWorkstationViewModel SerialHistoryWorkstation { get; set; } = new();
	}

	public class SerialHistoryWorkstationViewModel
	{
		public string WorkstationId { get; set; }
		public string WorkstationCode { get; set; }
		public string WorkstationName { get; set; }
		public List<SerialHistoryWorkPhaseViewModel> SerialHistoryWorkPhases { get; set; } = new();
	}

	public class SerialHistoryWorkPhaseViewModel
	{
		public string WorkPhaseId { get; set; }
		public string WorkPhaseCode { get; set; }
		public string WorkPhaseName { get; set; }
		public string WorkPhaseFlowType { get; set; }
		public List<SerialHistoryCartViewModel> SerialHistoryCarts { get; set; } = new();
	}

	public class SerialHistoryCartViewModel
	{
		public string CartId { get; set; }
		public string CartCode { get; set; }
		public int CartNumber { get; set; }
		public string CartOpenBy { get; set; }
		public DateTime CartOpenAt { get; set; }
		public string CartCloseBy { get; set; }
		public DateTime CartCloseAt { get; set; }

		public string Elapsed
		{
			get
			{
				if (CartCloseAt == DateTime.MinValue)
					return $"Start at: {CartOpenAt:HH:mm:ss}";
				return (CartCloseAt - CartOpenAt).ToHumanReadable("h:m:s");
			}
		}

		public string SerialDoneBy { get; set; }
		public DateTime SerialDoneAt { get; set; }
		public string SerialProductionDeclarationBy { get; set; }
		public DateTime SerialProductionDeclarationAt { get; set; }
	}
}

public class SearchInfoViewModel
{
	public SearchInfoViewModel(string pattern)
	{
		Pattern = pattern;
	}

	public string Pattern { get; set; }
	public List<DocumentViewModel> Documents { get; set; } = new();
	public List<MaterialViewModel> Materials { get; set; } = new();
	public List<SerialViewModel> Serials { get; set; } = new();
	public List<Drawing> Drawings { get; set; } = new();
	public List<SerialMaterialViewModel> SerialMaterials { get; set; } = new();
	public IEnumerable<CartRouteViewModel> CartRoutes { get; set; }
}

public class BatchHistoryViewModel
{
	//public BatchHistoryViewModel(IEnumerable<Models.Serial> serials, IEnumerable<CartRoute> cartRoutes)
	//{
	//	//Serials = serials.ToViewModel<Models.Serial, PlanningSerialViewModel>();
	//	Serials = serials.ToViewModel2();
	//	Carts = cartRoutes.ToViewModel<CartRoute, CartRouteLiteViewModel>();
	//}

	public IEnumerable<PlanningSerialViewModel> Serials { get; set; }
	public IEnumerable<CartRouteLiteViewModel> Carts { get; set; }
}
*/