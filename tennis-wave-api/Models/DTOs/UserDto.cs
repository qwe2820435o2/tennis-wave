using System;

namespace tennis_wave_api.Models.DTOs;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string? TennisLevel { get; set; }
    public string? PreferredLocation { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Bio { get; set; }
}

public class CreateUserDto
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string? TennisLevel { get; set; }
    public string? PreferredLocation { get; set; }
    public string? Bio { get; set; }
}

public class UpdateUserDto
{
    public string UserName { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string? TennisLevel { get; set; }
    public string? PreferredLocation { get; set; }
    public string? Bio { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}