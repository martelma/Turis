using JeMa.Shared;
using JeMa.Shared.Extensions;
using JeMa.Shared.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using OperationResults;
using Turis.Authentication.Entities;
using Turis.BusinessLayer.Services.Base;
using Turis.BusinessLayer.Services.Email;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common;
using Turis.DataAccessLayer;

namespace Turis.BusinessLayer.Services;

public class AdminService(IConfiguration configuration
	, UserManager<ApplicationUser> userManager
	, ApplicationDbContext dbContext
	, IServiceService serviceService
	, MailNotificationService mailNotificationService
	) : BaseService, IAdminService
{
	public Task<Result<IEnumerable<KeyValue>>> GetBackendConfiguration()
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

		return Task.FromResult<Result<IEnumerable<KeyValue>>>(list);
	}

	public Task<Result> TruncateElmah()
	{
		var connectionString = configuration["ConnectionStrings:DefaultConnection"];
		var sqlHelper = new SqlHelper(connectionString);
		sqlHelper.TruncateElmah();

		return Task.FromResult(Result.Ok());
	}

	public async Task<Result> MailProposal()
	{
		await serviceService.NotifyProposalAsync("e5a8c96b-1cbb-4a27-ba67-00018d5f18fc".ToGuid());

		return Result.Ok();
	}

	public async Task<Result> ResetAdminPassword()
	{
		var user = await userManager.FindByNameAsync("mario");
		if (user is null)
		{
			return Result.Fail(FailureReasons.ItemNotFound);
		}

		var passwordResetToken = await userManager.GeneratePasswordResetTokenAsync(user);

		var result = await userManager.ResetPasswordAsync(user, passwordResetToken, Constants.DefaultPassword);
		if (result.Succeeded)
		{
			return Result.Ok();
		}

		return Result.Fail(FailureReasons.ClientError, result.Errors?.Select(e => new ValidationError(e.Code, e.Description)));
	}
}
