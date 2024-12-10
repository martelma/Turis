using System.Diagnostics;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Turis.BusinessLayer.Resources;

namespace Turis.WebApi.Filters;

public class ValidatorFilter<T>(IValidator<T> validator, OperationResultOptions options) : IEndpointFilter where T : class
{
    public async ValueTask<object> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        if (context.Arguments.FirstOrDefault(a => a.GetType() == typeof(T)) is T input)
        {
            var validationResult = await validator.ValidateAsync(input);
            if (!validationResult.IsValid)
            {
                var statusCode = StatusCodes.Status400BadRequest;
                var problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Type = $"https://httpstatuses.io/{statusCode}",
                    Title = Account.ValidationError,
                    Instance = context.HttpContext.Request.Path
                };

                problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;

                if (options.ErrorResponseFormat == ErrorResponseFormat.Default)
                {
                    problemDetails.Extensions["errors"] = validationResult.ToDictionary();
                }
                else
                {
                    var errors = validationResult.Errors.Select(e => new { Name = e.PropertyName, Message = e.ErrorMessage });
                    problemDetails.Extensions["errors"] = errors;
                }

                return TypedResults.Json(problemDetails, statusCode: StatusCodes.Status400BadRequest, contentType: "application/problem+json; charset=utf-8");
            }

            return await next(context);
        }

        return TypedResults.BadRequest();
    }
}

public static class RouteHandlerBuilderExtensions
{
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) where T : class
        => builder.AddEndpointFilter<ValidatorFilter<T>>();
}