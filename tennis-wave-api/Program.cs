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

// Set up JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
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
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Controllers
builder.Services.AddControllers();

// Add Services
builder.Services.AddApplicationServices();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // 允许前端地址
                .AllowAnyHeader()
                .AllowAnyMethod();
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


// Cors
app.UseCors(MyAllowSpecificOrigins);

app.UseHttpsRedirection();


// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();


// Add Router
app.MapControllers();


app.Run();
