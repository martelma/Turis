using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

public class ApplicationRoleController : ApiController
{
	private ApplicationRoleRepository _repository;
	private readonly ApplicationRoleProjection _projection;

	public ApplicationRoleController(
		ApplicationDbContext context,
		RedisService redisService,
		ApplicationRoleRepository repository,
		ApplicationRoleProjection projection,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IMediator mediator
	) : base(context, redisService, notificationHubContext, mediator)
	{
		_repository = repository;
		_projection = projection;
	}

	[HttpGet("List")]
	public IEnumerable<ApplicationRoleViewModel> List()
	{
		var list = _repository.List();
		return list.Select(x => x.ToViewModel());
	}

	async Task<IEnumerable<ApplicationRoleViewModel>> GetList()
	{
		var list = await _projection.LookupListAll();
		if (list is null)
		{
			await _projection.Init();
			list = await _projection.LookupListAll();
		}

		return list;
	}

	[HttpGet("DropDownList")]
	public async Task<IEnumerable<DropDownListViewModel>> DropDownList()
	{
		return await _projection.LookupDropDownList();
	}

	[HttpGet("Search")]
	public async Task<IEnumerable<ApplicationRoleViewModel>> Search(string pattern)
	{
		var list = await GetList();

		if (!pattern.IsNullOrEmpty())
			foreach (var itemPattern in pattern.Split(' '))
			{
				list = list.Where(x => x.Name.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase)
									   || x.Description.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase));
			}

		return list;
	}

	[HttpGet("{id}")]
	public ApplicationRoleViewModel Get(string id)
	{
		return _repository.GetById(id).ToViewModel();
	}

	[HttpPost]
	public async Task<string> Post(ApplicationRoleViewModel model)
	{
		var record = new ApplicationRole
		{
			//Id = Guid.NewGuid().ToString(),
			Name = model.Name,
			Description = model.Description,
		};
		record = _repository.Insert(record);

		await Mediator.Publish(new CreatedDomainEvent<ApplicationRole>(record));

		return record.Id;
	}

	[HttpPut]
	public async Task<ActionResult> Put(ApplicationRoleViewModel model)
	{
		var record = _repository.GetById(model.Id);
		if (record == null)
			throw new Exception($"Nessun record trovato con id: {model.Id}");

		ApplicationRole recordOld = null; //(ApplicationRole)record.Clone();

		if (record.Name != model.Name
			|| record.Description != model.Description)
		{
			record.Name = model.Name;
			record.Description = model.Description;
			_repository.Update(record);
		}

		Sync(record.Id, model.Scopes);

		await Mediator.Publish(new UpdatedDomainEvent<ApplicationRole>(recordOld, record));

		return Ok();
	}

	void Sync(string roleId, IEnumerable<ApplicationScopeViewModel> viewModels)
	{
		var role = DbContext.Roles.Include(x => x.Scopes)
			.SingleOrDefault(x => x.Id == roleId);

		if (role != null)
		{
			var toRemove = role.Scopes
				.Where(y => !viewModels.Select(x => x.Id).Contains(y.Id)).ToList();

			foreach (var scope in toRemove)
				role.Scopes.Remove(scope);


			var toAdd = viewModels
				.Where(y => !role.Scopes.Select(x => x.Id).Contains(y.Id)).ToList();

			foreach (var item in toAdd)
			{
				var scope = DbContext.ApplicationScopes.SingleOrDefault(x => x.Id == item.Id);
				role.Scopes.Add(scope);
			}

			DbContext.SaveChanges();
		}
	}

	[HttpDelete("{id}")]
	public async Task<ActionResult> Delete(string id)
	{
		var record = _repository.GetById(id);
		if (record == null)
			throw new Exception($"Nessun record trovato con id: {id}");

		_repository.Delete(record);

		await Mediator.Publish(new DeletedDomainEvent<ApplicationRole>(record));

		return Ok();
	}
}