using System.Net;
using System.Text.Json;

namespace tennis_wave_api.Extensions;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new
        {
            Success = false,
            Message = GetUserFriendlyMessage(exception),
            Error = new
            {
                Type = exception.GetType().Name,
                Details = GetExceptionDetails(exception)
            },
            Timestamp = DateTime.UtcNow
        };

        context.Response.StatusCode = GetStatusCode(exception);

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }

    private static string GetUserFriendlyMessage(Exception exception)
    {
        return exception switch
        {
            BusinessException businessEx => businessEx.Message,
            ValidationException validationEx => validationEx.Message,
            KeyNotFoundException => "The requested resource does not exist",
            ArgumentException => "The request parameters are invalid",
            UnauthorizedAccessException => "Access denied",
            InvalidOperationException => "The operation could not be performed",
            _ => "Internal server error, please try again later"
        };
    }

    private static object GetExceptionDetails(Exception exception)
    {
        return new
        {
            Message = exception.Message,
            StackTrace = exception.StackTrace
        };
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            BusinessException => (int)HttpStatusCode.BadRequest,
            ValidationException => (int)HttpStatusCode.BadRequest,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };
    }
    
    
}