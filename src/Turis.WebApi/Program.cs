using ElmahCore.Mvc;
using ElmahCore.Sql;
using FluentEmail.MailKitSmtp;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.SqlServer;
using JeMa.Shared.AspNetCore.Filters;
using JeMa.Shared.AspNetCore.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using StackExchange.Redis.Extensions.Core.Configuration;
using StackExchange.Redis.Extensions.Newtonsoft;
using System.Text.Json.Serialization;
using FluentValidation;
using SimpleAuthentication;
using TinyHelpers.AspNetCore.Extensions;
using TinyHelpers.AspNetCore.Swagger;
using Turis.Authentication.Entities;
using Turis.Authentication.Settings;
using Turis.BusinessLayer.EventInterceptor.Base;
using Turis.BusinessLayer.Projections.Base;
using Turis.BusinessLayer.Services;
using Turis.BusinessLayer.Services.Email;
using Turis.BusinessLayer.Validations;
using Turis.Common.Interfaces;
using Turis.Common.Services;
using Turis.DataAccessLayer;
using Turis.WebApi.Extensions;
using TinyHelpers.Json.Serialization;
using Turis.Authentication.Handlers;
using Turis.Authentication.Validators;
using Turis.Authentication;
using Microsoft.Identity.Web;
using Microsoft.Extensions.Options;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.Services.Base;
using Turis.WebApi.Logging;
using Microsoft.AspNetCore.Http.Connections;
using Turis.Common.Hubs;
using Swashbuckle.AspNetCore.SwaggerUI;
using Turis.WebApi.ClientContext;

var builder = WebApplication.CreateBuilder(args);

var logger = new LoggerConfiguration()
	.ReadFrom.Configuration(builder.Configuration)
	.Enrich.FromLogContext()
	.CreateLogger();
builder.Host.UseSerilog(logger);

ConfigureServices(builder.Services, builder.Configuration);

var app = builder.Build();
Configure(app, app.Environment);

InitRedisConfiguration(app.Services);

app.Run();

void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
	var cdnSettings = services.ConfigureAndGet<CdnSettings>(configuration, nameof(CdnSettings));
	var smtpSettings = services.ConfigureAndGet<SmtpSettings>(configuration, nameof(SmtpSettings));
	var swaggerSettings = services.ConfigureAndGet<SwaggerSettings>(configuration, nameof(SwaggerSettings));
	var authenticationSettings = services.ConfigureAndGet<AuthenticationSettings>(configuration, nameof(AuthenticationSettings));
	var notificationSettings = services.ConfigureAndGet<NotificationSettings>(configuration, nameof(NotificationSettings));
	var redisConfiguration = services.ConfigureAndGet<RedisConfiguration>(configuration, nameof(RedisConfiguration));

	services.AddEndpointsApiExplorer();

	services.AddDbContext<IDbContext, ApplicationDbContext>(options =>
	{
		options.UseSqlServer(configuration.GetConnectionString("AuthenticationConnection"), providerOptions =>
		{
			providerOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
			providerOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(1), null);
		});
	});

	services.AddSqlServer<ApplicationDbContext>(configuration.GetConnectionString("DefaultConnection"), options =>
	{
		options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
	});

	services.AddElmah<SqlErrorLog>(options =>
	{
		options.ConnectionString = configuration.GetConnectionString("DefaultConnection");
	});

	services.AddOperationResult(options =>
	{
		options.ErrorResponseFormat = ErrorResponseFormat.List;

		options.StatusCodesMapping.Add(CustomFailureReasons.InvalidToken, StatusCodes.Status419AuthenticationTimeout);
		options.StatusCodesMapping.Add(CustomFailureReasons.LockedOut, StatusCodes.Status403Forbidden);
		options.StatusCodesMapping.Add(CustomFailureReasons.NotAllowded, StatusCodes.Status424FailedDependency);
		options.StatusCodesMapping.Add(CustomFailureReasons.PasswordExpired, StatusCodes.Status408RequestTimeout);
	});

	services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

	services.AddHttpClient();

	services.AddHttpContextAccessor();

	services.AddSingleton<ExternalDashboardAuthorizationService>();

	services.ConfigureHttpJsonOptions(options =>
	{
		options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
		options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
		options.SerializerOptions.Converters.Add(new StringEnumMemberConverter());
		options.SerializerOptions.Converters.Add(new UtcDateTimeConverter());
	});

	services.AddSingleton<ScopedServiceProviderAccessor>();
	services.AddSingleton<RedisService>();

	services.Scan(scan => scan
		.FromAssemblyOf<BaseProjection>()
		.AddClasses(classes => classes.AssignableTo<IProjection>())
		.AsSelf()
		.WithScopedLifetime()
	);

	services.Scan(scan => scan
		.FromAssemblyOf<IService>()
		.AddClasses(classes => classes.AssignableTo<IService>())
		.AsImplementedInterfaces()
		.WithScopedLifetime()
	);

	//services.AddSimpleAuthentication(builder.Configuration);
	//services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
	//{
	//	options.RequireHttpsMetadata = false;
	//	options.SaveToken = true;

	//	// Sending the access token in the query string is required due to
	//	// a limitation in Browser APIs. We restrict it to only calls to the
	//	// SignalR hub in this code.
	//	// See https://docs.microsoft.com/aspnet/core/signalr/security#access-token-logging
	//	// for more information about security considerations when using
	//	// the query string to transmit the access token.
	//	options.Events = new JwtBearerEvents
	//	{
	//		OnMessageReceived = context =>
	//		{
	//			var token = context.Request.Query["access_token"];

	//			// If the request is for our hub...
	//			var path = context.HttpContext.Request.Path;
	//			if (!string.IsNullOrEmpty(token) &&
	//			    path.StartsWithSegments("/notificationHub"))
	//			{
	//				// Read the token out of the query string
	//				context.Token = token;
	//			}

	//			return Task.CompletedTask;
	//		}
	//	};
	//});

	services.AddSignalR(hubOptions =>
	{
		hubOptions.EnableDetailedErrors = true;
		//hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
	});


	services.AddIdentityServices(builder.Configuration);
	services.AddApplicationId(builder.Configuration, configuration.GetValue<Guid>("AuthenticationSettings:ApplicationId"));

	services.AddClientContextAccessor(options =>
	{
		options.TimeZoneHeader = "timezone";
		options.DefaultTimeZone = Turis.Common.Constants.DefaultTimeZoneInfo;
	});

	// Set all endpoints as authorized by default.
	// Otherwise, they remain as anonymous
	services.AddAuthorization(options =>
	{
		options.FallbackPolicy = options.DefaultPolicy;
	});

	services.AddDefaultProblemDetails();
	services.AddDefaultExceptionHandler();

	services.AddStackExchangeRedisExtensions<NewtonsoftSerializer>(redisConfiguration);

	//Add FluentEmail.MailKit + FluentEmail.Razor
	var smtpClientOptions = new SmtpClientOptions
	{
		Server = smtpSettings.Host,
		Port = smtpSettings.Port,
		UseSsl = smtpSettings.UseSsl,
		RequiresAuthentication = smtpSettings.RequiresAuthentication,
		User = smtpSettings.Username,
		Password = smtpSettings.Password,
		SocketOptions = smtpSettings.SocketOptions,
	};
	services.AddFluentEmail(notificationSettings.SenderEmail, notificationSettings.SenderName)
	  .AddRazorRenderer()
	  .AddMailKitSender(smtpClientOptions);
	services.AddScoped<MailNotificationService>();

	services.ConfigureHttpJsonOptions(options =>
	{
		options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
	});

	services.AddMemoryCache();
	services.AddCors();

	if (swaggerSettings.IsEnabled)
	{
		services.AddEndpointsApiExplorer();

		services.AddSwaggerOperationParameters(options =>
		{
			options.Parameters.Add(new()
			{
				Name = authenticationSettings.ApplicationIdHeaderName,
				In = ParameterLocation.Header,
				Required = false,
				Schema = OpenApiSchemaHelper.CreateSchema<Guid>("string", "uuid")
			});
		});

		services.AddSwaggerGen(options =>
		{
			options.AddAcceptLanguageHeader();
			options.AddOperationParameters();
			options.AddDefaultResponse();

			options.AddSimpleAuthentication(configuration);
		});
	}

	services.AddMediatR(config =>
	{
		config.RegisterServicesFromAssemblyContaining<Program>();
		config.RegisterServicesFromAssemblyContaining<BaseEventInterceptor>();
	});

	services.AddHangfire((provider, configuration) =>
	{
		configuration.SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
		  .UseSimpleAssemblyNameTypeSerializer()
		  .UseRecommendedSerializerSettings()
		  .UseFilter(new AutomaticRetryAttribute { Attempts = 0, OnAttemptsExceeded = AttemptsExceededAction.Delete })
		  .UseSqlServerStorage(builder.Configuration.GetConnectionString("HangfireConnection"),
			  new SqlServerStorageOptions
			  {
				  CommandBatchMaxTimeout = TimeSpan.FromMinutes(10),
				  SlidingInvisibilityTimeout = TimeSpan.FromMinutes(10),
				  QueuePollInterval = TimeSpan.Zero,
				  UseRecommendedIsolationLevel = true,
				  DisableGlobalLocks = true
			  });
	});
	services.AddHangfireServer();

	services.AddDataProtection()
		.SetApplicationName(builder.Environment.ApplicationName)
		.PersistKeysToDbContext<ApplicationDbContext>();

	services.AddScoped(services =>
	{
		var provider = services.GetRequiredService<IDataProtectionProvider>();
		return provider.CreateProtector("security_codes").ToTimeLimitedDataProtector();
	});

	services.AddScoped(services =>
	{
		var provider = services.GetRequiredService<IDataProtectionProvider>();
		return provider.CreateProtector("protection");
	});

	services.AddScoped<IRoleValidator<ApplicationRole>, ApplicationRoleValidator>();
	services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
	{
		options.User.RequireUniqueEmail = true;
		options.SignIn.RequireConfirmedEmail = true;
		options.Lockout.MaxFailedAccessAttempts = authenticationSettings.Lockout.MaxFailedAccessAttempts;
		options.Lockout.DefaultLockoutTimeSpan = authenticationSettings.Lockout.DefaultLockout;
		options.Password.RequiredLength = authenticationSettings.Password.RequiredLength;
		options.Password.RequireNonAlphanumeric = authenticationSettings.Password.RequireNonAlphanumeric;
		options.Password.RequireLowercase = authenticationSettings.Password.RequireLowercase;
		options.Password.RequireUppercase = authenticationSettings.Password.RequireUppercase;
		options.Password.RequireDigit = authenticationSettings.Password.RequireDigit;
	})
	.AddEntityFrameworkStores<ApplicationDbContext>()
	.AddRoleValidator<ApplicationRoleValidator>()
	.AddDefaultTokenProviders()
	.AddErrorDescriber<LocalizedIdentityErrorDescriber>();

	services.AddSimpleAuthentication(configuration).AddMicrosoftIdentityWebApi(configuration, jwtBearerScheme: AzureAdSettings.AzureActiveDirectoryBearer);
	services.Configure<JwtBearerOptions>(AzureAdSettings.AzureActiveDirectoryBearer, options =>
	{
		options.TokenValidationParameters.NameClaimType = "preferred_username";
	});

	services.AddIdentityServices(configuration);
	services.AddTransient<IAuthorizationHandler, ApplicationAuthorizationHandler>();

	services.AddAuthorization(options =>
	{
		options.FallbackPolicy = options.DefaultPolicy;

		/*options.AddPolicy(PolicyNames.Owner, policy =>
        {
            policy.RequireAuthenticatedUser();
            policy.RequireRole(RoleNames.Owner);
        });

        options.AddPolicy(PolicyNames.Administrator, policy =>
        {
            policy.RequireAuthenticatedUser();
            policy.RequireRole(RoleNames.Administrator);
        });

        options.AddPolicy(PolicyNames.DashboardAdministrator, policy =>
        {
            policy.RequireAuthenticatedUser();
            policy.RequireRole(RoleNames.Administrator);
            policy.AddRequirements(new ApplicationRequirement(ApplicationNames.Dashboard));
        });*/
	});

	//services.AddRequestLocalization("it", "en");

	#region Localization

	var supportedCultures = new[] { "it", "en", "es", "fr" };
	var localizationOptions = new RequestLocalizationOptions()
		.AddSupportedCultures(supportedCultures)
		.AddSupportedUICultures(supportedCultures)
		.SetDefaultCulture(supportedCultures[0]);

	services.Configure<RequestLocalizationOptions>(options =>
	{
		options.SupportedCultures = localizationOptions.SupportedCultures;
		options.SupportedUICultures = localizationOptions.SupportedUICultures;
		options.DefaultRequestCulture = localizationOptions.DefaultRequestCulture;
	});

	#endregion
}

void Configure(WebApplication app, IWebHostEnvironment env)
{
	app.UseHttpsRedirection();
	app.UseStaticFiles();

	app.UseExceptionHandler();
	app.UseElmah();
	app.UseStatusCodePages();

	var enableSwagger = app.Services.GetService<IOptions<SwaggerSettings>>().Value.IsEnabled;
	if (enableSwagger)
	{
		app.UseMiddleware<SwaggerBasicAuthenticationMiddleware>();

		// Enable middleware to serve generated Swagger as a JSON endpoint.
		app.UseSwagger();

		// Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
		// specifying the Swagger JSON endpoint.
		app.UseSwaggerUI(options =>
		{
			options.RoutePrefix = string.Empty;
			options.SwaggerEndpoint("swagger/v1/swagger.json", "Turis Web API");
			//options.SwaggerEndpoint("swagger/v1/swagger.json", $"{Turis.Common.Constants.ApplicationName} Web API");
            options.InjectStylesheet("/css/swagger.css");
			options.DocExpansion(DocExpansion.None);
		});
	}

	app.UseRouting();
	app.UseClientContext();
	app.UseRequestLocalization();

	if (app.Environment.IsDevelopment())
	{
		app.UseCors(builder => builder
			//.WithOrigins("http://localhost:4200") // the Angular app
			.AllowAnyOrigin()
			.AllowAnyMethod()
			.AllowAnyHeader()
		);
	}
	else
	{
		app.UseCors(builder => builder
			.AllowAnyOrigin() //questa istruzione : incompatibile con AllowCredentials
			.AllowAnyMethod()
			.AllowAnyHeader()
		);
	}

	app.UseHangfireDashboard("/hangfire", new DashboardOptions
	{
		Authorization = new IDashboardAuthorizationFilter[] { new HangFireAuthorizationFilter() }
	});

	app.UseAuthentication();

	app.UseSerilogRequestLogging(options =>
	{
		options.EnrichDiagnosticContext = LogHelper.EnrichFromRequest;
		options.IncludeQueryInRequestPath = true;
	});

	app.UseAuthorization();

	//https://crontab.cronhub.io/
	var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();
	//recurringJobManager.AddOrUpdate<IFileService>("ClearCdnTemp", service => service.ClearCdnTemp(), "0 0/10 6-18 ? * MON,TUE,WED,THU,FRI");

	app.MapEndpoints();

	app.MapHub<NotificationHub>("/notificationHub", options =>
	{
		options.Transports = HttpTransportType.WebSockets | HttpTransportType.LongPolling;
	}).AllowAnonymous();
}

void InitRedisConfiguration(IServiceProvider serviceProvider)
{
	//var redisService = serviceProvider.GetService<RedisService>();

	//var assembly = typeof(ProductionCenter).Assembly;
	//var types = assembly.GetTypes()
	//	.Where(x => !x.IsAbstract)
	//	.Where(x => !x.IsInterface)
	//	.Where(x => typeof(ICachedEntity).IsAssignableFrom(x))
	//	.ToList();

	//foreach (var type in types)
	//	redisService.DataModel.Add(type);
}
