using ElmahCore.Mvc;
using ElmahCore.Sql;
using FluentEmail.MailKitSmtp;
using FluentValidation;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.SqlServer;
using JeMa.Shared.AspNetCore.Filters;
using JeMa.Shared.AspNetCore.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;
using Microsoft.Net.Http.Headers;
using Microsoft.OpenApi.Models;
using Serilog;
using SimpleAuthentication;
using StackExchange.Redis.Extensions.Core.Configuration;
using StackExchange.Redis.Extensions.Newtonsoft;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Text.Json;
using System.Text.Json.Serialization;
using TinyHelpers.AspNetCore.Extensions;
using TinyHelpers.AspNetCore.Swagger;
using TinyHelpers.Json.Serialization;
using Turis.Authentication;
using Turis.Authentication.Entities;
using Turis.Authentication.Handlers;
using Turis.Authentication.Settings;
using Turis.Authentication.Validators;
using Turis.BusinessLayer.Erorrs;
using Turis.BusinessLayer.EventInterceptor.Base;
using Turis.BusinessLayer.Projections.Base;
using Turis.BusinessLayer.Services.Base;
using Turis.BusinessLayer.Services.Email;
using Turis.BusinessLayer.Settings;
using Turis.BusinessLayer.Validations;
using Turis.Common.Hubs;
using Turis.Common.Interfaces;
using Turis.Common.Models.Requests;
using Turis.Common.Services;
using Turis.DataAccessLayer;
using Turis.DataAccessLayer.Entities.Base;
using Turis.WebApi.ClientContext;
using Turis.WebApi.Extensions;
using Turis.WebApi.Logging;

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
	var appSettings = services.ConfigureAndGet<AppSettings>(configuration, nameof(AppSettings));
	var cdnSettings = services.ConfigureAndGet<CdnSettings>(configuration, nameof(CdnSettings));
	var smtpSettings = services.ConfigureAndGet<SmtpSettings>(configuration, nameof(SmtpSettings));
	var swaggerSettings = services.ConfigureAndGet<SwaggerSettings>(configuration, nameof(SwaggerSettings));
	var authenticationSettings = services.ConfigureAndGet<AuthenticationSettings>(configuration, nameof(AuthenticationSettings));
	var notificationSettings = services.ConfigureAndGet<NotificationSettings>(configuration, nameof(NotificationSettings));
	var redisConfiguration = services.ConfigureAndGet<RedisConfiguration>(configuration, nameof(RedisConfiguration));

	services.AddEndpointsApiExplorer();
	services.AddHttpContextAccessor();

	services.ConfigureHttpJsonOptions(options =>
	{
		options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
		options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
		options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
		options.SerializerOptions.Converters.Add(new StringEnumMemberConverter());
		options.SerializerOptions.Converters.Add(new UtcDateTimeConverter());
	});

	services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

	services.AddDefaultProblemDetails();
	services.AddDefaultExceptionHandler();

	services.AddOperationResult(options =>
	{
		options.ErrorResponseFormat = ErrorResponseFormat.List;

		options.StatusCodesMapping.Add(CustomFailureReasons.InvalidToken, StatusCodes.Status419AuthenticationTimeout);
		options.StatusCodesMapping.Add(CustomFailureReasons.LockedOut, StatusCodes.Status403Forbidden);
		options.StatusCodesMapping.Add(CustomFailureReasons.NotAllowded, StatusCodes.Status424FailedDependency);
		options.StatusCodesMapping.Add(CustomFailureReasons.PasswordExpired, StatusCodes.Status408RequestTimeout);
	});

	services.AddRequestLocalization("it", "en");

	services.AddDbContext<IDbContext, ApplicationDbContext>(options =>
	{
		options.UseSqlServer(configuration.GetConnectionString("AuthenticationConnection"), providerOptions =>
		{
			providerOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
			providerOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(1), null);
		})
		.LogTo(Console.WriteLine, LogLevel.Information);
	});

	services.AddSqlServer<ApplicationDbContext>(configuration.GetConnectionString("DefaultConnection"), options =>
	{
		options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
	});

	services.AddScoped<IRoleValidator<ApplicationRoleRequest>, ApplicationRoleValidator>();
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
		.AddDefaultTokenProviders()
		.AddErrorDescriber<LocalizedIdentityErrorDescriber>();

	services.AddSimpleAuthentication(configuration).AddMicrosoftIdentityWebApi(configuration, jwtBearerScheme: AzureAdSettings.AzureActiveDirectoryBearer);
	services.Configure<JwtBearerOptions>(AzureAdSettings.AzureActiveDirectoryBearer, options =>
	{
		options.TokenValidationParameters.NameClaimType = "preferred_username";
	});

	services.AddIdentityServices(builder.Configuration);
	services.AddApplicationId(builder.Configuration, configuration.GetValue<Guid>("AuthenticationSettings:ApplicationId"));

	// Set all endpoints as authorized by default.
	// Otherwise, they remain as anonymous
	services.AddAuthorization(options =>
	{
		options.FallbackPolicy = options.DefaultPolicy;
	});

	services.AddDataProtection()
		.SetApplicationName(builder.Environment.ApplicationName)
		.PersistKeysToDbContext<ApplicationDbContext>();

	services.AddScoped(services =>
	{
		var provider = services.GetRequiredService<IDataProtectionProvider>();
		return provider.CreateProtector("timeLimitedProtector").ToTimeLimitedDataProtector();
	});

	services.AddElmah<SqlErrorLog>(options =>
	{
		options.ConnectionString = configuration.GetConnectionString("DefaultConnection");
	});

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
			options.AddDefaultProblemDetailsResponse();

			options.AddSimpleAuthentication(configuration);
		});
	}

	services.AddSingleton<ExternalDashboardAuthorizationService>();

	services.AddSingleton<ScopedServiceProviderAccessor>();

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

	services.AddSingleton<RedisService>();

	services.AddHttpClient();

	services.AddSignalR(hubOptions =>
	{
		hubOptions.EnableDetailedErrors = true;
		//hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
	});

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
	services.AddTransient<FileSaveSender>();
	services.AddScoped<MailNotificationService>();

	services.ConfigureHttpJsonOptions(options =>
	{
		options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
	});

	services.AddClientContextAccessor(options =>
	{
		options.TimeZoneHeader = "timezone";
		options.DefaultTimeZone = Turis.Common.Constants.DefaultTimeZoneInfo;
	});

	services.AddMemoryCache();

	services.AddMediatR(config =>
	{
		config.RegisterServicesFromAssemblyContaining<Program>();
		config.RegisterServicesFromAssemblyContaining<BaseEventInterceptor>();
	});

	services.AddSingleton<NotificationHubManager>();
	services.AddTransient<INotificationHubService, NotificationHubService>();

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

	services.AddCors(options =>
	{
		options.AddDefaultPolicy(builder =>
		{
			builder
				.AllowAnyHeader()
				.AllowAnyMethod()
				.SetIsOriginAllowed(_ => true)
				.AllowCredentials()
				.WithExposedHeaders(HeaderNames.ContentDisposition);
		});
	});
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
			options.SwaggerEndpoint("/swagger/v1/swagger.json", "Turis Web API");
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
	var redisService = serviceProvider.GetService<RedisService>();

	var assembly = typeof(BaseEntity).Assembly;
	var types = assembly.GetTypes()
		.Where(x => !x.IsAbstract)
		.Where(x => !x.IsInterface)
		.Where(x => typeof(ICachedEntity).IsAssignableFrom(x))
		.ToList();
}
