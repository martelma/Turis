using JeMa.Shared;
using JeMa.Shared.Helpers;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using OperationResults;
using Turis.BusinessLayer.Services.Base;
using Turis.BusinessLayer.Services.Interfaces;

namespace Turis.BusinessLayer.Services;

public class AdminService(IConfiguration configuration) : BaseService, IAdminService
{
	public async Task<Result<IEnumerable<KeyValue>>> GetBackendConfiguration()
    {
        var list = new List<KeyValue>();

#if DEBUG
        list.Add(new KeyValue("Environment", configuration["Environment"]));
#endif

        list.Add(new KeyValue("WorkspaceUrl", configuration["WorkspaceApiSettings:Url"]));
        list.Add(new KeyValue("WorkspaceApiKey", configuration["WorkspaceApiSettings:ApiKey"]));

        using var defaultConnection = new SqlConnection(configuration.GetConnectionString("DefaultConnection"));
        list.Add(new KeyValue("DefaultConnection", $"{defaultConnection.DataSource} - {defaultConnection.Database}"));

        using var hangfireConnection = new SqlConnection(configuration.GetConnectionString("HangfireConnection"));
        list.Add(new KeyValue("HangfireConnection", $"{hangfireConnection.DataSource} - {hangfireConnection.Database}"));

        return list;
    }

    public Task<Result> TruncateElmah()
	{
		var connectionString = configuration["ConnectionStrings:DefaultConnection"];
		var sqlHelper = new SqlHelper(connectionString);
		sqlHelper.TruncateElmah();

		return Task.FromResult(Result.Ok());
	}
}
