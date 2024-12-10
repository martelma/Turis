using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

public class ApplicationScopeController : ApiController
{
	private ApplicationScopeRepository _repository;
	private readonly ApplicationScopeProjection _projection;

	public ApplicationScopeController(
		ApplicationDbContext context,
		RedisService redisService,
		ApplicationScopeRepository repository,
		ApplicationScopeProjection projection,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IMediator mediator
	) : base(context, redisService, notificationHubContext, mediator)
	{
		_repository = repository;
		_projection = projection;
	}


	[HttpGet("List")]
	public IEnumerable<ApplicationScopeViewModel> List()
	{
		var list = _repository.List();
		return list.Select(x => x.ToViewModel());
	}

	async Task<IEnumerable<ApplicationScopeViewModel>> GetList()
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
	public async Task<IEnumerable<ApplicationScopeViewModel>> Search(string pattern)
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
	public ApplicationScopeViewModel Get(string id)
	{
		return _repository.GetById(id).ToViewModel();
	}

	[HttpPost]
	public async Task<string> Post(ApplicationScopeViewModel model)
	{
		var record = new ApplicationScope
		{
			//Id = Guid.NewGuid().ToString(),
			Name = model.Name,
			Description = model.Description,
			ApplicationScopeGroupId = model.ApplicationScopeGroupId,
		};
		record = _repository.Insert(record);

		await Mediator.Publish(new CreatedDomainEvent<ApplicationScope>(record));

		return record.Id;
	}

	[HttpPut]
	public async Task<ActionResult> Put(ApplicationScopeViewModel model)
	{
		var record = _repository.GetById(model.Id);
		if (record == null)
			throw new Exception($"Nessun record trovato con id: {model.Id}");

		var recordOld = (ApplicationScope)record.Clone();

		record.Name = model.Name;
		record.Description = model.Description;
		record.ApplicationScopeGroupId = model.ApplicationScopeGroupId;
		_repository.Update(record);

		await Mediator.Publish(new UpdatedDomainEvent<ApplicationScope>(recordOld, record));

		return Ok();
	}

	[HttpDelete("{id}")]
	public async Task<ActionResult> Delete(string id)
	{
		var record = _repository.GetById(id);
		if (record == null)
			throw new Exception($"Nessun record trovato con id: {id}");

		_repository.Delete(record);

		await Mediator.Publish(new DeletedDomainEvent<ApplicationScope>(record));

		return Ok();
	}
}