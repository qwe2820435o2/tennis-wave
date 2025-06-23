namespace tennis_wave_api.Models.DTOs;

/// <summary>
/// Data Transfer Object for authentication responses (after login or registration).
/// Contains user info and the JWT token.
/// </summary>
public class AuthResponseDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}