using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

public class PrintController : ApiController
{
	private readonly IConfiguration _configuration;

	public PrintController(
		ApplicationDbContext context,
		RedisService redisService,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IConfiguration configuration,
		IMediator mediator) : base(context, redisService, notificationHubContext, mediator)
	{
		_configuration = configuration;
	}

	/*
	[HttpGet("Labels/{cartRouteId}")]
	public async Task<ActionResult> Labels(string cartRouteId)
	{
		var cartRoute = _cartRouteRepository.GetById(cartRouteId);

		var list = cartRoute.CartRouteSerials.Select(x => new PrintLabel(x, _drawService, _materialRepository, _documentRepository, _boxProductionRepository, GetCoprodotti(x))).ToList();
		var json = JsonConvert.SerializeObject(list);

		var relativeUrl = $"/api/Print/Labels";
		var bytes = await GetByteArray(relativeUrl, json);

		var mimeType = "application/pdf";
		var fileName = @$"Labels.pdf";
		return File(bytes, mimeType, fileName);
	}

	/// <summary>
	/// Restituisce la lista dei coprodotti (ma solo per il contesto SAP)
	/// </summary>
	/// <param name="cartRouteSerial"></param>
	/// <returns></returns>
	static IEnumerable<SerialMaterial> GetCoprodotti(CartRouteSerial cartRouteSerial)
	{
		return cartRouteSerial
			.Serial
			.SerialMaterials
			.Where(x => x.TypePosition == "L")
			.Where(x => x.InventoryMovementType == "101")
			.Where(x => x.CodeMaterial != cartRouteSerial.CodeMaterial);
	}

	[HttpGet("Cart/{cartRouteId}")]
	public async Task<ActionResult> CartItems(string cartRouteId)
	{
		var cartRoute = _cartRouteRepository.GetById(cartRouteId);
		var printCart = new PrintCart(cartRoute.ToViewModel(_drawService, _materialRepository, _documentRepository, _boxProductionRepository));
		var json = JsonConvert.SerializeObject(printCart);

		var relativeUrl = $"/api/Print/Cart";
		var bytes = await GetByteArray(relativeUrl, json);

		//System.IO.File.WriteAllBytes(@"c:\temp\Cart.pdf", bytes);

		var mimeType = "application/pdf";
		var fileName = @$"CartItems.pdf";
		return File(bytes, mimeType, fileName);
	}

	private async Task<byte[]> GetByteArray(string relativeUrl, string json)
	{
		var client = new HttpClient();
		var baseUrl = _configuration["printApi:baseUrl"];
		var url = $"{baseUrl.TrimEnd('/')}{relativeUrl}";

		var data = new StringContent(json, Encoding.UTF8, "application/json");

		var response = await client.PostAsync(url, data);
		if (!response.IsSuccessStatusCode)
		{
			await using var readAsStreamAsync = await response.Content.ReadAsStreamAsync();
			using var jsonDocument = await JsonDocument.ParseAsync(readAsStreamAsync);
			var error = jsonDocument.RootElement.GetProperty("ExceptionMessage").GetString();

			if (!error.HasValue())
				error = response.ReasonPhrase;
			throw new Exception(error);
		}

		var bytes = await response.Content.ReadAsByteArrayAsync();
		return bytes;
	}

	public class PrintLabel
	{
		public PrintLabel()
		{

		}

		public PrintLabel(CartRouteSerial item, IDrawService drawService, MaterialRepository materialRepository, DocumentRepository documentRepository, BoxProductionRepository boxProductionRepository, IEnumerable<SerialMaterial> coprodotti = null)
		{
			var cartSerial = item.ToViewModel(drawService, materialRepository, documentRepository, boxProductionRepository);

			CartId = cartSerial.CartId;
			CartBaseCode = cartSerial.CartBaseCode;
			CartNumber = cartSerial.CartNumber;
			ProcessCode = cartSerial.ProcessCode;
			ProcessName = cartSerial.ProcessName;
			WotkstationCode = cartSerial.WorkstationCode;
			WorkstationName = cartSerial.WorkstationName;
			WorkPhaseFlowType = cartSerial.WorkPhaseFlowType;

			UserOpen = item.CartRoute.UserOpen?.FullName;
			TimeStampeOpen = item.CartRoute.TsOpen;
			UserClose = item.CartRoute.UserClose?.FullName;
			TimeStampeClose = item.CartRoute.TsClose;

			SerialId = cartSerial.Serial.Id;
			SerialCode = cartSerial.Serial.Code;
			ViewOrder = cartSerial.ViewOrder;
			Sequence = cartSerial.Serial.Sequence;
			SequenceText = SequenceHelper.ToText(Sequence);

			DueDate = cartSerial.Serial.DocumentDueDate;
			DocumentBatch = cartSerial.Serial?.DocumentBatch;
			DocumentNumber = cartSerial.Serial?.DocumentNumber;
			//DocumentCustomer= cartSerial.Serial.Document.Parent.CodeStructure;
			CodeMaterial = cartSerial.CodeMaterial;
			DesMaterial = cartSerial.DesMaterial;
			DrawCode = cartSerial.DrawCode;
			DrawRevision = cartSerial.DrawRevision;
			CodeProgram = cartSerial.CodeProgram;
			Quantity = cartSerial.Quantity.ToString();
			CodeUnitMeasure = cartSerial.CodeUnitMeasure;
			CodeMaterialProductionOrder = cartSerial.CodeMaterialProductionOrder;
			DesMaterialProductionOrder = cartSerial.DesMaterialProductionOrder;
			DrawCodeProductionOrder = cartSerial.DrawCodeProductionOrder;
			DrawRevisionProductionOrder = cartSerial.DrawRevisionProductionOrder;
			QuantityProductionOrder = cartSerial.QuantityProductionOrder.ToString();
			CodeUnitMeasureProductionOrder = cartSerial.CodeUnitMeasureProductionOrder;

			ParentDocumentNumber = cartSerial.Serial.ParentDocumentNumber;
			ParentDueDate = cartSerial.Serial.ParentDocumentDueDate.Date;
			ParentSequenceText = cartSerial.Serial.ParentSequence;
			ParentSequenceOldText = cartSerial.Serial.ParentSequenceOld;
			ParentCodeMaterial = cartSerial.Serial.ParentDocumentCodeMaterial;
			ParentDesMaterial = cartSerial.Serial.ParentDocumentDesMaterial;
			ParentBatch = cartSerial.Serial.ParentDocumentBatch;
			ParentCustomer = cartSerial.Serial.ParentDocumentCodeStructure;

			if (coprodotti != null)
				Coprodotti = coprodotti.Select(x => new Coprodotto(x)).ToList();
		}

		public IEnumerable<Coprodotto> Coprodotti { get; set; }

		public string CartId { get; set; }
		public string CartBaseCode { get; set; }
		public int CartNumber { get; set; }
		public string CartNumberText => $"C{CartNumber.ToString().PadLeft(9, '0')}";
		public string ProcessCode { get; set; }
		public string ProcessName { get; set; }
		public string WotkstationCode { get; set; }
		public string WorkstationName { get; set; }
		public string WorkPhaseFlowType { get; set; }

		public string UserOpen { get; set; }
		public DateTime TimeStampeOpen { get; set; }
		public string UserClose { get; set; }
		public DateTime TimeStampeClose { get; set; }

		public string SerialId { get; set; }
		public string SerialCode { get; set; }
		public int ViewOrder { get; set; }
		public int Sequence { get; set; }
		public string SequenceText { get; set; }
		public DateTime DueDate { get; set; }
		public string DocumentBatch { get; set; }
		public string DocumentNumber { get; set; }

		public string CodeMaterial { get; set; }
		public string DesMaterial { get; set; }
		public string DrawCode { get; set; }
		public string DrawRevision { get; set; }
		public string CodeProgram { get; set; }
		public string Quantity { get; set; }
		public string CodeUnitMeasure { get; set; }
		public string CodeMaterialProductionOrder { get; set; }
		public string DesMaterialProductionOrder { get; set; }
		public string DrawCodeProductionOrder { get; set; }
		public string DrawRevisionProductionOrder { get; set; }
		public string QuantityProductionOrder { get; set; }
		public string CodeUnitMeasureProductionOrder { get; set; }

		public string ParentDocumentNumber { get; set; }
		public DateTime ParentDueDate { get; set; }
		public string ParentSequenceText { get; set; }
		public string ParentSequenceOldText { get; set; }
		public string ParentCodeMaterial { get; set; }
		public string ParentDesMaterial { get; set; }
		public string ParentBatch { get; set; }
		public string ParentCustomer { get; set; }
	}

	public class Coprodotto
	{
		public Coprodotto(SerialMaterial serialMaterial)
		{
			SerialId = serialMaterial.Serial.Id;
			CodeMaterial = serialMaterial.CodeMaterial;
			DesMaterial = serialMaterial.DesMaterial;
		}

		public string SerialId { get; set; }
		public string CodeMaterial { get; set; }
		public string DesMaterial { get; set; }
	}

	public class PrintCart
	{
		public PrintCart()
		{

		}

		public PrintCart(CartRouteViewModel model)
		{
			CartId = model.CartId;
			CartBaseCode = model.CartBaseCode;
			CartNumber = model.CartNumber;
			CartNumberText = model.CartNumberText;
			MinSequence = model.MinSequence;
			MinSequenceText = model.MinSequenceText;
			MaxSequence = model.MaxSequence;
			MaxSequenceText = model.MaxSequenceText;
			ProcessId = model.Id;
			ProcessCode = model.ProcessCode;
			ProcessName = model.ProcessName;
			Released = model.Released;
			WotkstationCode = model.WorkstationCode;
			WotkstationName = model.WorkstationName;
			WorkPhaseFlowType = model.WorkPhaseFlowType;
			UserOpen = model.UserOpenFullName;
			TimeStampeOpen = model.TsOpen;
			UserClose = model.UserCloseFullName;
			TimeStampeClose = model.TsClose;

			Details = model.Details.Select(x => new PrintCartItem(x)).ToList();
		}

		public string CartId { get; set; }
		public string CartBaseCode { get; set; }
		public int CartNumber { get; set; }
		public string CartNumberText { get; set; }
		public int MinSequence { get; set; }
		public string MinSequenceText { get; set; }
		public int MaxSequence { get; set; }
		public string MaxSequenceText { get; set; }
		public string ProcessId { get; set; }
		public string ProcessCode { get; set; }
		public string ProcessName { get; set; }
		public bool Released { get; set; }
		public string WotkstationCode { get; set; }
		public string WotkstationName { get; set; }
		public string WorkPhaseFlowType { get; set; }
		public string UserOpen { get; set; }
		public DateTime TimeStampeOpen { get; set; }
		public string UserClose { get; set; }
		public DateTime TimeStampeClose { get; set; }
		public IEnumerable<PrintCartItem> Details { get; set; }
	}

	public class PrintCartItem
	{
		public string Id { get; set; }
		public string SerialCode { get; set; }
		public string CartId { get; set; }
		public int CartNumber { get; set; }
		public int ViewOrder { get; set; }
		public int Sequence { get; set; }
		public string SequenceText { get; set; }
		public DateTime DueDate { get; set; }
		public string DocumentBatch { get; set; }
		public string DocumentNumber { get; set; }

		public string CodeMaterial { get; set; }
		public string DesMaterial { get; set; }
		public string DrawCode { get; set; }
		public string DrawRevision { get; set; }
		public string CodeProgram { get; set; }
		public string Quantity { get; set; }
		public string CodeUnitMeasure { get; set; }
		public string OriginalProductionOrder { get; set; }
		public string CodeMaterialProductionOrder { get; set; }
		public string DesMaterialProductionOrder { get; set; }
		public string DrawCodeProductionOrder { get; set; }
		public string DrawRevisionProductionOrder { get; set; }
		public string QuantityProductionOrder { get; set; }
		public string CodeUnitMeasureProductionOrder { get; set; }

		public string ParentDocumentNumber { get; set; }
		public DateTime ParentDueDate { get; set; }
		public string ParentSequenceText { get; set; }
		public string ParentSequenceOldText { get; set; }
		public string ParentCodeMaterial { get; set; }
		public string ParentDesMaterial { get; set; }
		public string ParentBatch { get; set; }
		public string ParentCustomer { get; set; }

		public PrintCartItem()
		{

		}

		public PrintCartItem(CartRouteSerialViewModel cartSerial)
		{
			Id = cartSerial.Id;
			SerialCode = cartSerial.Serial.Code;
			CartId = cartSerial.CartId;
			CartNumber = cartSerial.CartNumber;
			ViewOrder = cartSerial.ViewOrder;
			Sequence = cartSerial.Serial.Sequence;
			SequenceText = cartSerial.Serial.SequenceText;

			DocumentBatch = cartSerial.Serial.DocumentBatch;
			DocumentNumber = cartSerial.Serial.DocumentNumber;
			DueDate = cartSerial.Serial.DocumentDueDate;

			CodeMaterial = cartSerial.CodeMaterial;
			DesMaterial = cartSerial.DesMaterial;
			DrawCode = cartSerial.DrawCode;
			DrawRevision = cartSerial.DrawRevision;
			//TODO: CodeProgram
			CodeProgram = "todo";

			Quantity = cartSerial.Quantity.ToString();
			CodeUnitMeasure = cartSerial.CodeUnitMeasure;

			OriginalProductionOrder = cartSerial.OriginalProductionOrder;
			CodeMaterialProductionOrder = cartSerial.CodeMaterialProductionOrder;
			DesMaterialProductionOrder = cartSerial.DesMaterialProductionOrder;
			DrawCodeProductionOrder = cartSerial.DrawCodeProductionOrder;
			DrawRevisionProductionOrder = cartSerial.DrawRevisionProductionOrder;
			QuantityProductionOrder = cartSerial.QuantityProductionOrder.ToString();
			CodeUnitMeasureProductionOrder = cartSerial.CodeUnitMeasureProductionOrder;

			ParentDocumentNumber = cartSerial.Serial.ParentDocumentNumber;
			ParentDueDate = cartSerial.Serial.ParentDocumentDueDate;
			ParentSequenceText = cartSerial.Serial.ParentSequence;
			ParentSequenceOldText = cartSerial.Serial.ParentSequenceOld;
			ParentCodeMaterial = cartSerial.Serial.ParentDocumentCodeMaterial;
			ParentDesMaterial = cartSerial.Serial.ParentDocumentDesMaterial;
			ParentBatch = cartSerial.Serial.ParentDocumentBatch;
			ParentCustomer = cartSerial.Serial.ParentDocumentCodeStructure;
		}
	}
	*/
}