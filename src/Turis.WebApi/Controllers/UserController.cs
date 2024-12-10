using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ApiController
{
	private UserRepository _repository;
	private readonly ApplicationUserProjection _projection;
	private readonly UserManager<ApplicationUser> _userManager;
	private readonly IHostEnvironment _environment;
	private readonly ILogger<UserController> _logger;

	const int BaseRowIndex = 3;

	public UserController(
		ApplicationDbContext context,
		RedisService redisService,
		UserRepository repository,
		ApplicationUserProjection projection,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		UserManager<ApplicationUser> userManager,
		IHostEnvironment environment,
		IMediator mediator,
		ILogger<UserController> logger
	) : base(context, redisService, notificationHubContext, mediator)
	{
		_environment = environment;
		_logger = logger;
		_userManager = userManager;

		_repository = repository;
		_projection = projection;
	}

	private async Task<IEnumerable<ApplicationUserViewModel>> GetList()
	{
		var list = await _projection.LookupListAll();
		if (list is null)
		{
			await _projection.Init();
			list = await _projection.LookupListAll();
		}

		return list;
	}

	[HttpGet("List")]
	public async Task<IEnumerable<ApplicationUserViewModel>> List()
	{
		//return repository.List()
		//	.ToViewModel<ApplicationUser, ApplicationUserViewModel>()
		//	.OrderBy(x => x.FullName)
		//	.ToList();
		return await GetList();
	}

	[HttpGet("Search")]
	public async Task<IEnumerable<ApplicationUserViewModel>> Search(string pattern)
	{
		var list = await GetList();

		if (!pattern.IsNullOrEmpty())
			foreach (var itemPattern in pattern.Split(' '))
			{
				list = list.Where(x => x.FirstName.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase)
				                       || x.LastName.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase)
				                       || x.UserName.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase)
				                       || x.Email.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase));
			}

		return list;
	}

	[HttpGet("Profile")]
	public ApplicationUserViewModel Profile()
	{
		return CurrentApplicationUser.ToViewModel();
	}

	[HttpPut("Profile")]
	public async Task<IActionResult> Profile([FromBody] ApplicationUserViewModel model)
	{
		var user = CurrentApplicationUser;
		if (user == null)
			throw new Exception($"Nessun utente trovato con id: {model.Id}");
		{

			user.FirstName = model.FirstName;
			user.LastName = model.LastName;

			_repository.Update(user);
		}
		return Ok();
	}

	[HttpGet("{id}")]
	public ApplicationUserViewModel Get(string id)
	{
		var user = _repository.GetById(id);
		var model = user.ToViewModel();
		return model;
	}

	[HttpPost]
	[Authorize(Roles = Constants.RoleAdmin)]
	public async Task<ActionResult> Create([FromBody] RegisterRequestViewModel model)
	{
		try
		{
			var user = await _userManager.FindByNameAsync(model.UserName);
			if (user != null)
				throw new Exception($"UserName [{model.UserName}] alredy exist!");

			user = new ApplicationUser
			{
				UserName = model.UserName,
				FirstName = model.FirstName,
				LastName = model.LastName,
				Email = model.Email,
			};
			if (model.Password.IsNullOrEmpty())
				model.Password = Constants.DefaultPassword;
			await _userManager.CreateAsync(user, model.Password);

			if (!model.Roles.IsEmpty())
				await _userManager.AddToRolesAsync(user, model.Roles);

			await Mediator.Publish(new CreatedDomainEvent<ApplicationUser>(user));

			return Ok();
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex);
			throw;
		}
	}

	[HttpPut]
	public async Task<ActionResult> Update([FromBody] ApplicationUserViewModel model)
	{
		var user = await _userManager.FindByIdAsync(model.Id);
		if (user == null)
			throw new Exception($"Nessun utente trovato con id: {model.Id}");

		var recordOld = await _userManager.FindByIdAsync(model.Id);

		user.FirstName = model.FirstName;
		user.LastName = model.LastName;
		user.Email = model.Email;

		await _userManager.UpdateAsync(user);

		var oldRoles = await _userManager.GetRolesAsync(user);
		if (!model.Roles.OrderBy(x => x).SequenceEqual(oldRoles))
		{
			await _userManager.RemoveFromRolesAsync(user, oldRoles);
			await _userManager.AddToRolesAsync(user, model.Roles);
		}

		await Mediator.Publish(new UpdatedDomainEvent<ApplicationUser>(recordOld, user));

		return Ok();
	}

	[HttpDelete("{id}")]
	[Authorize(Roles = Constants.RoleAdmin)]
	public async Task<ActionResult> Delete(string id)
	{
		var user = await _userManager.FindByIdAsync(id);
		if (user == null)
			throw new Exception($"Nessun utente trovato con id: {id}");

		await _userManager.DeleteAsync(user);

		await Mediator.Publish(new DeletedDomainEvent<ApplicationUser>(user));

		return Ok();
	}

	[HttpPost("DeafultPassword")]
	[Authorize(Roles = Constants.RoleAdmin)]
	public async Task<IActionResult> DeafultPassword(ResetPasswordViewModel model)
	{
		var user = await _userManager.FindByIdAsync(model.Id);
		if (user == null)
			return NotFound("Utente non trovato");

		var result = await _userManager.RemovePasswordAsync(user);
		if (!result.Succeeded)
			return BadRequest(result.Errors);

		result = await _userManager.AddPasswordAsync(user, Constants.DefaultPassword);
		if (!result.Succeeded)
			return BadRequest(result.Errors);

		return Ok();
	}

	[Authorize]
	[HttpPost("ChangePassword")]
	public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordViewModel model)
	{
		if (!model.UserName.Equals(CurrentUserName))
			return BadRequest("Utente non abilitato!");

		if (!model.NewPassword1.Equals(model.NewPassword2))
			return BadRequest("Nuova Password e Conferma Password non coincidono!");

		var user = await _userManager.FindByNameAsync(model.UserName);
		if (user == null)
			return NotFound("Utente non trovato");

		var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword1);
		if (!result.Succeeded)
			return BadRequest(result.Errors);

		return Ok();
	}

	private string GetFullFileNameAvatarImage(ApplicationUser user)
	{
		var relativePath = Path.Combine("cdn", "avatars", $"{user.UserName}.png");
		var avatarFullFileName = Path.Combine(_environment.ContentRootPath, "wwwroot", relativePath);

		return avatarFullFileName;
	}

	[HttpGet("DownloadTemplate")]
	public async Task<IActionResult> DownloadTemplate()
	{
		var workbook = new XSSFWorkbook();

		var fieldsSheet1 = new List<TemplateFieldViewModel>
		{
			new TemplateFieldViewModel
			{
				Name = "User Name",
			},
			new TemplateFieldViewModel
			{
				Name = "E-Mail",
			},
			new TemplateFieldViewModel
			{
				Name = "First Name",
			},
			new TemplateFieldViewModel
			{
				Name = "Last Name",
			},
		};
		var sheet1 = TemplateHelper.PrepareSheet(workbook, "Users", fieldsSheet1);
		workbook.Add(sheet1.Autosize());

		var fieldsSheet2 = new List<TemplateFieldViewModel>
		{
			new TemplateFieldViewModel
			{
				Name = "User Name",
			},
			new TemplateFieldViewModel
			{
				Name = "Role",
			},
		};
		var sheet2 = TemplateHelper.PrepareSheet(workbook, "UserRoles", fieldsSheet2);
		workbook.Add(sheet2.Autosize());

		return DownloadWorkbook(workbook, "Users.xls");
	}

	[HttpGet("DownloadData")]
	public async Task<IActionResult> DownloadData()
	{
		var list = _repository.List().OrderBy(x => x.UserName).ToList();

		var workbook = new XSSFWorkbook();

		var fieldsSheet1 = new List<TemplateFieldViewModel>
		{
			new TemplateFieldViewModel
			{
				Name = "User Name",
			},
			new TemplateFieldViewModel
			{
				Name = "E-Mail",
			},
			new TemplateFieldViewModel
			{
				Name = "First Name",
			},
			new TemplateFieldViewModel
			{
				Name = "Last Name",
			},
		};
		var sheet1 = TemplateHelper.PrepareSheet(workbook, "Users", fieldsSheet1);
		PopulateSheet1(sheet1, list);
		workbook.Add(sheet1.Autosize());

		var fieldsSheet2 = new List<TemplateFieldViewModel>
		{
			new TemplateFieldViewModel
			{
				Name = "User Name",
			},
			new TemplateFieldViewModel
			{
				Name = "Role",
			},
		};
		var sheet2 = TemplateHelper.PrepareSheet(workbook, "UserRoles", fieldsSheet2);
		PopulateSheet2(sheet2, list);
		workbook.Add(sheet2.Autosize());

		return DownloadWorkbook(workbook, "Users.xls");
	}

	private static void PopulateSheet1(ISheet sheetProcess, List<ApplicationUser> list)
	{
		var rowIndex = BaseRowIndex;

		foreach (var item in list)
		{
			var col = 0;
			var row = sheetProcess.CreateRow(rowIndex++);

			row.CreateCell(++col, CellType.String).SetCellValue(item.UserName);
			row.CreateCell(++col, CellType.Numeric).SetCellValue(item.Email);
			row.CreateCell(++col, CellType.String).SetCellValue(item.FirstName);
			row.CreateCell(++col, CellType.String).SetCellValue(item.LastName);
		}
	}

	private static void PopulateSheet2(ISheet sheetProcess, List<ApplicationUser> list)
	{
		var rowIndex = BaseRowIndex;

		foreach (var item in list)
		{
			foreach (var det in item.UserRoles)
			{
				var col = 0;
				var row = sheetProcess.CreateRow(rowIndex++);

				row.CreateCell(++col, CellType.String).SetCellValue(item.UserName);
				row.CreateCell(++col, CellType.String).SetCellValue(det.Role.Name);
			}
		}
	}

	[HttpPost("Upload")]
	public async Task<JsonResult> Upload([FromForm(Name = "files")] IFormFile[] files)
	{
		if (files == null || files.Length == 0)
			throw new Exception("Please select file");

		var executionLog = "";
		foreach (var file in files.OrderBy(x => x.Name))
		{
			if (file == null || file.Length == 0)
				continue;

			executionLog += await ExecUpload(file);
			executionLog += "\n";
		}

		return new JsonResult(executionLog);
	}

	async Task<OkResult> ExecUpload(IFormFile file)
	{
		var workbook = new XSSFWorkbook(file.OpenReadStream());

		var sheet1 = workbook.GetSheet("Users");
		var sheet2 = workbook.GetSheet("UserRoles");


		for (var rowIndex = BaseRowIndex - 1; rowIndex <= sheet1.LastRowNum; rowIndex++)
		{
			var row = sheet1.GetRow(rowIndex);
			if (row == null || row.IsEmpty())
				continue;

			var userName = row.GetCell(1).StringCellValue;
			if (userName.IsNullOrEmpty())
				continue;

			var roles = GetRoles(sheet2, userName);

			var user = await _userManager.FindByNameAsync(userName);
			if (user != null)
			{
				user.Email = row.GetCell(2).StringCellValue;
				user.FirstName = row.GetCell(3).StringCellValue;
				user.LastName = row.GetCell(4).StringCellValue;
				await _userManager.UpdateAsync(user);

				var currentRoles = await _userManager.GetRolesAsync(user);

				var olderRoles = currentRoles.Except(roles).ToList();
				if (olderRoles.Count > 0)
					await _userManager.RemoveFromRolesAsync(user, olderRoles);

				var newerRoles = roles.Except(currentRoles).ToList();
				if (newerRoles.Count > 0)
					await _userManager.AddToRolesAsync(user, newerRoles);
			}
			else
			{
				user = new ApplicationUser
				{
					UserName = userName,
					Email = row.GetCell(2).StringCellValue,
					FirstName = row.GetCell(3).StringCellValue,
					LastName = row.GetCell(4).StringCellValue,
				};
				await _userManager.CreateAsync(user, Constants.DefaultPassword);
				await _userManager.AddToRolesAsync(user, roles);
			}
		}

		await _projection.Init();

		return Ok();
	}

	IEnumerable<string> GetRoles(ISheet sheet, string userName)
	{
		var list = new List<string>();

		for (var rowIndex = 0; rowIndex <= sheet.LastRowNum; rowIndex++)
		{
			var row = sheet.GetRow(rowIndex);
			if (userName == row.GetCell(1).StringCellValue)
				list.Add(row.GetCell(2).StringCellValue);

		}

		return list;
	}
}