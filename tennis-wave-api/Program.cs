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

// Cors - Configured for Public Networking
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:3000", // 本地开发
                    "https://localhost:3000", // 本地开发 HTTPS
                    "https://tennis-wave-front-production.up.railway.app", // 生产环境前端
                    "https://tennis-wave-front-staging.up.railway.app" // 测试环境前端
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials() // Required for SignalR
                .SetIsOriginAllowedToAllowWildcardSubdomains(); // Allow subdomains
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
    
    Console.WriteLine($"🔍 CORS Debug: Request from origin: {origin}");
    Console.WriteLine($"🔍 CORS Debug: Request method: {method}");
    Console.WriteLine($"🔍 CORS Debug: Request path: {path}");
    
    // Handle preflight requests explicitly
    if (method == "OPTIONS")
    {
        Console.WriteLine($"🔍 CORS Debug: Handling preflight request for {path}");
        context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
        context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        context.Response.StatusCode = 200;
        return;
    }
    
    await next();
    
    // Log response headers
    Console.WriteLine($"🔍 CORS Debug: Response status: {context.Response.StatusCode}");
    Console.WriteLine($"🔍 CORS Debug: Access-Control-Allow-Origin: {context.Response.Headers["Access-Control-Allow-Origin"]}");
    Console.WriteLine($"🔍 CORS Debug: Access-Control-Allow-Methods: {context.Response.Headers["Access-Control-Allow-Methods"]}");
    Console.WriteLine($"🔍 CORS Debug: Access-Control-Allow-Headers: {context.Response.Headers["Access-Control-Allow-Headers"]}");
});

app.UseHttpsRedirection();

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();


// Add Router
app.MapControllers();

// Map SignalR Hub
app.MapHub<tennis_wave_api.Services.ChatHub>("/chatHub");


app.Run();
