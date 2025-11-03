using MinimalHelpers.OpenApi;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.Common.Models.Requests;
using Turis.Common.Models.Responses;
using Turis.WebApi.Filters;

namespace Turis.WebApi.Endpoints;

public class AuthEndpoints : IEndpointRouteHandlerBuilder
{
	public static void MapEndpoints(IEndpointRouteBuilder endpoints)
	{
		var templateApiGroup = endpoints.MapGroup("/api/auth");

		templateApiGroup.MapGet("check", Check)
			.WithOpenApi(operation =>
			{
				operation.Summary = "A control request to test validity logged-in users and tokens";

				return operation;
			});

		//templateApiGroup.MapPost("SecurityCode", SecurityCode);

		templateApiGroup.MapPost("login", LoginAsync)
			.AllowAnonymous()
			.WithValidation<LoginRequest>()
			.Produces<LoginResponse>(StatusCodes.Status200OK)
			.Produces<LoginResponse>(StatusCodes.Status206PartialContent)
			.Produces<ServiceError>(StatusCodes.Status403Forbidden)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Performs the login of a user";

				operation.Response(StatusCodes.Status200OK).Description = "Login successful";
				operation.Response(StatusCodes.Status206PartialContent).Description = "You have logged in, but your password has expired";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Incorrect username and/or password";
				operation.Response(StatusCodes.Status403Forbidden).Description = "The user was blocked due to too many failed logins";

				return operation;
			});

		//templateApiGroup.MapPost("authenticate", AuthenticateAsync)
		//	.RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = AzureAdSettings.AzureActiveDirectoryBearer })
		//	.Produces<LoginResponse>(StatusCodes.Status200OK)
		//	.ProducesValidationProblem()
		//	.WithOpenApi(operation =>
		//	{
		//		operation.Summary = "Checks the validity of the token obtained through Azure Active Directory and obtains the application token";

		//		operation.Response(StatusCodes.Status200OK).Description = "Login successful";

		//		return operation;
		//	});

		templateApiGroup.MapPost("refresh-token", RefreshTokenAsync)
			.AllowAnonymous()
			.Produces<LoginResponse>(StatusCodes.Status200OK)
			.Produces<ServiceError>(StatusCodes.Status419AuthenticationTimeout)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Updates the validity of the current user token";

				operation.Response(StatusCodes.Status200OK).Description = "The new token";
				operation.Response(StatusCodes.Status400BadRequest).Description = "The current access token or refresh token is invalid";
				operation.Response(StatusCodes.Status419AuthenticationTimeout).Description = "The period for updating token validity has ended";

				return operation;
			});

		templateApiGroup.MapPost("change-password", ChangePasswordAsync)
			.WithValidation<ChangePasswordRequest>()
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Updates the password of the current user";

				operation.Response(StatusCodes.Status204NoContent).Description = "Password update successful";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Unable to update due to errors in input data";
				operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

				return operation;
			});

		templateApiGroup.MapPost("reset-password-request", GeneratePasswordResetTokenAsync)
			.AllowAnonymous()
			.Produces(StatusCodes.Status204NoContent)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Sends a new token to reset the password via email";

				operation.Response(StatusCodes.Status204NoContent).Description = "The email has been successfully sent";

				return operation;
			});

		templateApiGroup.MapPost("reset-password", ResetPasswordAsync)
			.AllowAnonymous()
			//TODO: da riattivare questa riga dopo una verifica da fare anche lato Workspace
			//.WithValidation<ResetPasswordRequest>()
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Performs the reset of the password using a verification token";

				operation.Response(StatusCodes.Status204NoContent).Description = "The new password has been successfully reset";
				operation.Response(StatusCodes.Status400BadRequest).Description = "The password could not be reset due to input errors (token not valid or new password do not respect the requisites)";
				operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

				return operation;
			});

		templateApiGroup.MapPost("reset-default-password", ResetDefaultPasswordAsync)
			.Produces(StatusCodes.Status204NoContent)
			.Produces<ServiceError>(StatusCodes.Status404NotFound)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Performs the reset of the password to default value";

				operation.Response(StatusCodes.Status204NoContent).Description = "The new password has been successfully reset";
				operation.Response(StatusCodes.Status400BadRequest).Description = "The password could not be reset due to input errors (token not valid or new password do not respect the requisites)";
				operation.Response(StatusCodes.Status404NotFound).Description = "User not found";

				return operation;
			});

		templateApiGroup.MapGet("otp", GenerateOtpAsync)
			.Produces<OtpResponse>(StatusCodes.Status200OK)
			.WithOpenApi(operation =>
			{
				operation.Summary = "Creates an OTP to carry the current Access and Refresh Token to another application";

				operation.Response(StatusCodes.Status200OK).Description = "The OTP to retrieve the corresponding Access and Refresh Token";

				return operation;
			});

		templateApiGroup.MapPost("otp", ValidateOtpAsync)
			.AllowAnonymous()
			.Produces<LoginResponse>(StatusCodes.Status200OK)
			.ProducesValidationProblem()
			.WithOpenApi(operation =>
			{
				operation.Summary = "Uses an OTP to retrieve the corresponding the Access and Refresh Token for the user";

				operation.Response(StatusCodes.Status200OK).Description = "The new access token";
				operation.Response(StatusCodes.Status400BadRequest).Description = "Invalid OTP";

				return operation;
			});

		templateApiGroup.MapPost("security-code", SecurityCodeAsync).WithOpenApi(operation =>
		{
			operation.Summary = "Creates a security code for Elmah";

			operation.Response(StatusCodes.Status200OK).Description = "The new security code for elmah";

			return operation;
		});
	}

	private static Task<IResult> Check(HttpContext httpContext)
	{
		var result = OperationResults.Result.Ok();
		return Task.FromResult(result.ToResponse(httpContext));
	}

    private static async Task<IResult> SecurityCode(HttpContext httpContext, IAuthService service)
		=> (await service.CreateSecurityCodeAsync()).ToResponse(httpContext);

    private static async Task<IResult> LoginAsync(LoginRequest request, IIdentityService identityService, HttpContext httpContext)
    {
	    var result = await identityService.LoginAsync(request);

	    // If the response contains a token to confirm the password change, it means that the current password has expired.
	    var statusCode = result.Success && result.Content.ChangePasswordToken.HasValue() ? StatusCodes.Status206PartialContent : StatusCodes.Status200OK;

	    var response = httpContext.CreateResponse(result, statusCode);
	    return response;
    }

    private static async Task<IResult> AuthenticateAsync(IIdentityService identityService, HttpContext httpContext)
    {
	    var result = await identityService.AuthenticateAsync();
	    var response = httpContext.CreateResponse(result);

	    return response;
    }

    private static async Task<IResult> RefreshTokenAsync(RefreshTokenRequest request, IIdentityService identityService, HttpContext httpContext)
    {
	    var result = await identityService.RefreshTokenAsync(request);
	    var response = httpContext.CreateResponse(result);

	    return response;
    }

	private static async Task<IResult> ChangePasswordAsync(ChangePasswordRequest request, IIdentityService identityService, HttpContext httpContext)
	{
		var result = await identityService.ChangePasswordAsync(request);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> GeneratePasswordResetTokenAsync(GeneratePasswordResetTokenRequest request, IIdentityService identityService, HttpContext httpContext)
	{
		var result = await identityService.GeneratePasswordResetTokenAsync(request);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> ResetPasswordAsync(ResetPasswordRequest request, IIdentityService identityService, HttpContext httpContext)
	{
		var result = await identityService.ResetPasswordAsync(request);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> ResetDefaultPasswordAsync(ResetDefaultPasswordRequest request, IIdentityService identityService, HttpContext httpContext)
	{
		var result = await identityService.ResetDefaultPasswordAsync(request);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> GenerateOtpAsync(IIdentityService identityService, HttpContext httpContext)
	{
		var result = await identityService.GenerateOtpAsync();
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> ValidateOtpAsync(ValidateOtpRequest request, IIdentityService identityService, HttpContext httpContext)
	{
		var result = await identityService.ValidateOtpAsync(request);
		var response = httpContext.CreateResponse(result);

		return response;
	}

	private static async Task<IResult> SecurityCodeAsync(HttpContext httpContext, IIdentityService service)
	{
		var result = await service.CreateSecurityCodeAsync();
		var response = httpContext.CreateResponse(result);

		return response;
	}
}