using Turis.WebApi.Controllers.Base;

namespace Turis.WebApi.Controllers;

public class ApplicationScopeGroupController : ApiController
{
	private readonly ApplicationScopeGroupRepository _repository;
	private readonly ApplicationScopeGroupProjection _projection;

	public ApplicationScopeGroupController(
		ApplicationDbContext context,
		RedisService redisService,
		ApplicationScopeGroupRepository repository,
		ApplicationScopeGroupProjection projection,
		IHubContext<NotificationHub, INotificationHub> notificationHubContext,
		IMediator mediator) : base(context, redisService, notificationHubContext, mediator)
	{
		_repository = repository;
		_projection = projection;
	}

	async Task<IEnumerable<ApplicationScopeGroupViewModel>> GetList()
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

	[HttpGet("List")]
	public async Task<IEnumerable<ApplicationScopeGroupViewModel>> List()
	{
		return await GetList();
	}

	[HttpGet("Search")]
	public async Task<IEnumerable<ApplicationScopeGroupViewModel>> Search(string pattern)
	{
		var list = await GetList();

		if (!pattern.IsNullOrEmpty())
			foreach (var itemPattern in pattern.Split(' '))
			{
				list = list.Where(x => x.Code.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase)
				                       || x.Name.Contains(itemPattern, StringComparison.CurrentCultureIgnoreCase));
			}

		return list;
	}

	[HttpGet("{id}")]
	public ApplicationScopeGroupViewModel Get(string id)
	{
		return _repository.GetById(id).ToViewModel();
	}

	[HttpPost]
	public async Task<ActionResult> Post(ApplicationScopeGroupViewModel model)
	{
		var record = new ApplicationScopeGroup
		{
			Code = model.Code,
			Name = model.Name,
			Description = model.Description,
		};
		_repository.Insert(record);

		await Mediator.Publish(new CreatedDomainEvent<ApplicationScopeGroup>(record));

		return Ok();
	}

	[HttpPut]
	public async Task<ActionResult> Put(ApplicationScopeGroupViewModel model)
	{
		var record = _repository.GetById(model.Id);
		if (record == null)
			throw new Exception($"Nessun record trovato con id: {model.Id}");

		var recordOld = (ApplicationScopeGroup)record.Clone();

		record.Code = model.Code;
		record.Name = model.Name;
		record.Description = model.Description;
		_repository.Update(record);

		await Mediator.Publish(new UpdatedDomainEvent<ApplicationScopeGroup>(recordOld, record));

		return Ok();
	}

	[HttpDelete("{id}")]
	public async Task<ActionResult> Delete(string id)
	{
		var record = _repository.GetById(id);
		if (record == null)
			throw new Exception($"Nessun record trovato con id: {id}");

		_repository.Delete(record);

		await Mediator.Publish(new DeletedDomainEvent<ApplicationScopeGroup>(record));

		return Ok();
	}
}