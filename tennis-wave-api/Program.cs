using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using tennis_wave_api.Data;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models;
using tennis_wave_api.Models.Entities;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

// Serilog Config
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Set up JWT with environment variable support
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings == null)
{
    jwtSettings = new JwtSettings
    {
        SecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? "your-super-secret-key-here-make-it-long-and-random-at-least-32-characters",
        Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "tennis-wave-api",
        Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "tennis-wave-users",
        ExpiryInMinutes = 60
    };
}
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings?.Issuer,
            ValidAudience = jwtSettings?.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtSettings?.SecretKey ?? string.Empty))
        };

        // Configure JWT Bearer for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Enhance Swagger Config
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Tennis Wave API",
        Version = "v1.0.0",
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        // A short description for the authentication scheme.
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        // The name of the header that will contain the JWT.
        Name = "Authorization",
        // The location of the API key.
        In = ParameterLocation.Header,
        // The type of the security scheme.
        Type = SecuritySchemeType.Http, 
        // The name of the HTTP authorization scheme.
        Scheme = "bearer", 
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Add services to the container.
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? 
                      builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Add Controllers
builder.Services.AddControllers();

// Add Services
builder.Services.AddApplicationServices();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Add SignalR
builder.Services.AddSignalR();

// Cors - Enhanced for SignalR and API
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy
                .SetIsOriginAllowed(_ => true) // Allow any origin but specify explicitly
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // Important for SignalR
        });
    
    // Special policy for SignalR
    options.AddPolicy("SignalRPolicy",
        policy =>
        {
            policy
                .SetIsOriginAllowed(_ => true) // Allow all origins for SignalR
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});


var app = builder.Build();

// Show current info
var env = builder.Environment.EnvironmentName;
var appName = builder.Configuration["AppSettings:AppName"] ?? "Tennis Wave API";
var version = builder.Configuration["AppSettings:Version"] ?? "1.0.0";

Console.WriteLine("=".PadRight(60, '='));
Console.WriteLine($"Starting {appName} v{version}");
Console.WriteLine($"Environment: {env}");
Console.WriteLine($"Database: {builder.Configuration.GetConnectionString("DefaultConnection")?.Split(';').FirstOrDefault()?.Split('=').LastOrDefault() ?? "Not configured"}");
Console.WriteLine($"Log Level: {builder.Configuration["Logging:LogLevel:Default"] ?? "Information"}");
Console.WriteLine("=".PadRight(60, '='));


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Tennis Wave API v1");
        c.DocumentTitle = "Tennis Wave API Documentation";
    });
    app.UseDeveloperExceptionPage();
}
else
{   
    app.UseMiddleware<ExceptionHandlerMiddleware>();
}


// Cors - Must be before authentication and authorization
app.UseCors(MyAllowSpecificOrigins);

// Add CORS debugging middleware
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"].ToString();
    var method = context.Request.Method;
    var path = context.Request.Path;
    var userAgent = context.Request.Headers["User-Agent"].ToString();
    
    Console.WriteLine($"🔍 CORS Debug: Request from origin: {origin}");
    Console.WriteLine($"🔍 CORS Debug: Request method: {method}");
    Console.WriteLine($"🔍 CORS Debug: Request path: {path}");
    Console.WriteLine($"🔍 CORS Debug: User-Agent: {userAgent}");
    
    // Special handling for SignalR negotiate requests
    if (path.StartsWithSegments("/chatHub") && path.Value?.Contains("negotiate") == true)
    {
        Console.WriteLine($"🔍 CORS Debug: SignalR negotiate request detected");
        Console.WriteLine($"🔍 CORS Debug: Access token present: {!string.IsNullOrEmpty(context.Request.Query["access_token"])}");
    }
    
    await next();
    
    // Log response headers
    Console.WriteLine($"🔍 CORS Debug: Response status: {context.Response.StatusCode}");
    Console.WriteLine($"🔍 CORS Debug: Access-Control-Allow-Origin: {context.Response.Headers["Access-Control-Allow-Origin"]}");
    Console.WriteLine($"🔍 CORS Debug: Access-Control-Allow-Credentials: {context.Response.Headers["Access-Control-Allow-Credentials"]}");
});

app.UseHttpsRedirection();

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();


// Add Router
app.MapControllers();

// Map SignalR Hub with CORS policy
app.MapHub<tennis_wave_api.Services.ChatHub>("/chatHub")
    .RequireCors("SignalRPolicy");


app.Run();
