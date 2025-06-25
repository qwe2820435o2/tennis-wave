using System.ComponentModel.DataAnnotations;

namespace tennis_wave_api.Models.DTOs;

/// <summary>
/// DTO for viewing user profile
/// </summary>
public class UserProfileDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string? TennisLevel { get; set; }
    public string? PreferredLocation { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for updating user profile
/// </summary>
public class UpdateUserProfileDto
{
    [StringLength(50, MinimumLength = 2, ErrorMessage = "The length of the username must be between 2 and 50 characters")]
    public string? UserName { get; set; }
    
    [StringLength(500, ErrorMessage = "A personal profile should not exceed 500 characters")]
    public string? Bio { get; set; }
    
    [StringLength(100, ErrorMessage = "The tennis level cannot exceed 100 characters")]
    public string? TennisLevel { get; set; }
    
    [StringLength(200, ErrorMessage = "The preferred location cannot exceed 200 characters")]
    public string? PreferredLocation { get; set; }
    
    [Url(ErrorMessage = "The format of the avatar URL is incorrect")]
    public string? Avatar { get; set; }
}

/// <summary>
/// DTO for changing password
/// </summary>
public class ChangePasswordDto
{
    [Required(ErrorMessage = "The current password cannot be empty")]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "The new password cannot be empty")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "The password length must be between 6 and 100 characters")]
    public string NewPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Confirm that the password cannot be empty")]
    [Compare("NewPassword", ErrorMessage = "The new password doesn't match the confirmed password")]
    public string ConfirmPassword { get; set; } = string.Empty;
} 