using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class AccountController : ApiController
{
	private readonly UserRepository _repository;
	private readonly SignInManager<ApplicationUser> _signInManager;
	private readonly UserManager<ApplicationUser> _userManager;
	private readonly IHostEnvironment _environment;
	private readonly IUserService _userService;
	private readonly ILogger<AccountController> _logger;
	private readonly IJwtBearerService _bearerService;
	private readonly JwtBearerSettings _optionsBearerService;
	private readonly ITimeLimitedDataProtector _timeLimitedDataProtector;
	private readonly IAvatarService _avatarService;

	public AccountController(
		ApplicationDbContext context,
		RedisService redisService,
		UserRepository repository,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		UserManager<ApplicationUser> userManager,
		SignInManager<ApplicationUser> signInManager,
		IHostEnvironment environment,
		IUserService userService,
		IMediator mediator,
		ILogger<AccountController> logger,
		IJwtBearerService bearerService,
		IOptions<JwtBearerSettings> optionsBearerService,
		ITimeLimitedDataProtector timeLimitedDataProtector,
		IAvatarService avatarService
	) : base(context, redisService, notificationHubContext, mediator)
	{
		_environment = environment;
		_userService = userService;
		_logger = logger;
		_bearerService = bearerService;
		_optionsBearerService = optionsBearerService.Value;
		_timeLimitedDataProtector = timeLimitedDataProtector;
		_avatarService = avatarService;
		_userManager = userManager;
		_signInManager = signInManager;

		_repository = repository;
	}

	[HttpPost("Login")]
	public async Task<AuthResponseViewModel> Login([FromBody] LoginRequestViewModel model)
	{
		var result = await _signInManager.PasswordSignInAsync(model.UserName, model.Password, false, lockoutOnFailure: false);
		if (result.Succeeded)
		{
			var user = _repository.GetByUserName(model.UserName);

			var token = GenerateJwtToken(user);
			var securityCode = _timeLimitedDataProtector.Protect(user.Id.ToString(), DateTime.UtcNow.Add(_optionsBearerService.ExpirationTime.Value));

			return new AuthResponseViewModel { Token = token, SecurityCode = securityCode };
		}

		throw new UnauthorizedAccessException();
	}

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

	[HttpPost("RecoveryPassword")]
	public async Task<IActionResult> RecoveryPassword([FromBody] RecoveryPasswordViewModel model)
	{
		var user = await _userManager.FindByNameAsync(model.Email);
		if (user == null)
			return NotFound("Utente non trovato");

		user.ConfirmationCode = CodeGenerator.RandomNumbersString(6);
		_repository.Update(user);

		//var notificationHelper = new NotificationHelper(HttpContext, _configuration, _emailService);
		//await notificationHelper.UserRecoveryPasswordFeedback(user);

		return Ok();
	}

	[HttpPost("SendConfirmationCode")]
	public async Task<string> SendConfirmationCode([FromBody] SendConfirmationCodeViewModel model)
	{
		var user = await _userManager.FindByNameAsync(model.Email);
		if (user != null)
		{
			//var notificationHelper = new NotificationHelper(HttpContext, _configuration, _emailService);
			//await notificationHelper.UserRegistrationLocalFeedback(user);
		}

		return user.Id;
	}

	[HttpGet("ConfirmEmail")]
	public async Task<IActionResult> ConfirmEmail(string userId, string code)
	{
		var user = await _userManager.FindByIdAsync(userId);
		if (user == null)
			return NotFound("Utente non trovato");

		code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
		var result = await _userManager.ConfirmEmailAsync(user, code);

		if (!result.Succeeded)
			return BadRequest("Codice di Conferma non corretto");

		user.EmailConfirmed = true;
		_repository.Update(user);

		return Ok();
	}

	[HttpPost("ConfirmUserEmail")]
	public async Task<IActionResult> ConfirmUserEmail([FromBody] ConfirmUserEmailViewModel model)
	{
		var user = await _userManager.FindByNameAsync(model.Email);
		if (user == null)
		{
			Logger.LogError($"Utente non trovato per l'email: {model.Email}");
			return NotFound("Utente non trovato");
		}

		if (user.ConfirmationCode != model.ConfirmationCode)
		{
			Logger.LogError($"Codice di Conferma non corretto: {model.ConfirmationCode}");
			return BadRequest("Codice di Conferma non corretto");
		}

		user.EmailConfirmed = true;
		_repository.Update(user);

		return Ok();
	}

	[HttpPost("RecoveryPassword2")]
	public async Task<IActionResult> RecoveryPassword2([FromBody] RecoveryPassword2ViewModel model)
	{
		var user = await _userManager.FindByNameAsync(model.Email);
		if (user == null)
			return NotFound("Utente non trovato");

		if (user.ConfirmationCode != model.ConfirmationCode)
			return BadRequest("Codice di Conferma non corretto");

		await _userManager.RemovePasswordAsync(user);
		var result = await _userManager.AddPasswordAsync(user, model.Password);
		if (!result.Succeeded)
			return BadRequest(result.Errors);

		return Ok();
	}

	[Authorize]
	[HttpGet("GenerateToken")]
	public Task<AuthResponseViewModel> GenerateToken()
	{
		var user = _repository.GetById(_userService.GetUserId());
		if(user == null)
			throw new UnauthorizedAccessException();

		var token = GenerateJwtToken(user);
		var securityCode = _timeLimitedDataProtector.Protect(user.Id, DateTime.UtcNow.Add(_optionsBearerService.ExpirationTime.Value));

		return Task.FromResult(new AuthResponseViewModel { Token = token, SecurityCode = securityCode });
	}

	private string GenerateJwtToken(ApplicationUser user)
	{
		var issuedAt = DateTimeOffset.UtcNow;

		//Learn more about JWT claims at: https://tools.ietf.org/html/rfc7519#section-4
		var claims = new List<Claim>
		{
			new Claim(JwtRegisteredClaimNames.Sub, user.Id), //Subject, should be unique in this scope
            new Claim(JwtRegisteredClaimNames.Iat, //Issued at, when the token is issued
                issuedAt.ToUnixTimeMilliseconds().ToString(), ClaimValueTypes.Integer64),
			new Claim(ClaimTypes.NameIdentifier, user.Id),
			new Claim("FirstName", user.FirstName),
			new Claim("LastName", user.LastName),
			new Claim("FullName", user.FullName),

			//TODO: gestire Language
			new Claim("Language", "de"),
			//new Claim("Language", user.Language),
			
			new Claim("UserName", user.UserName),
			new Claim("Email", user.Email),
			new Claim(ClaimTypes.Email, user.Email),
			new Claim("EmailConfirmed", user.EmailConfirmed.ToString().ToLower()),
			new Claim(ClaimTypes.GivenName, user.FirstName.SafeRead()),
			new Claim(ClaimTypes.Surname, user.LastName.SafeRead()),
		};

		if (System.IO.File.Exists(GetFullFileNameAvatarImage(user)))
		{
			//https://localhost:44335/cdn/avatars/m.martellini@jemasoftware.it.Png
			var url = $"{Request.Scheme}://{Request.Host}/cdn/avatars/{user.UserName}.png";
			claims.Add(new Claim("picture", url));
		}
		else
			claims.Add(new Claim("picture", user.PictureURL.SafeRead()));

		//var obj = repository.GetByUserName(user.UserName);

		var roles = user?.UserRoles?.Select(x => x.Role);
		if (roles != null)
			foreach (var item in roles)
				claims.Add(new Claim(ClaimTypes.Role, item.Name));

		var scopes = roles.SelectMany(x => x.Scopes).Select(y => y.Name);
		claims.Add(new Claim("scope", string.Join(',', scopes)));

		var token = _bearerService.CreateToken(user.UserName, claims);
		return token;
	}

	private string? GetFullFileNameAvatarImage(ApplicationUser user)
	{
		var relativePath = Path.Combine("cdn", "avatars", $"{user.UserName}.png");
		var avatarFullFileName = Path.Combine(_environment.ContentRootPath, "wwwroot", relativePath);

		return avatarFullFileName;
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

	[HttpPost("ResetAvatar")]
	public async Task<IActionResult> ResetAvatar()
	{
		await _avatarService.Delete();

		return NoContent();
	}

	[HttpPost("SaveAvatar")]
	public async Task<IActionResult> SaveAvatar(IFormFile file)
	{
		var userId = _userService.GetUserId();

		await _avatarService.Save(file.OpenReadStream(), file.FileName, userId);

		return NoContent();
	}

}