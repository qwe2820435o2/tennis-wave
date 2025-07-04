namespace tennis_wave_api.Models.DTOs;

public class UserSearchDto
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string? Avatar { get; set; }
    public bool IsOnline { get; set; } 
}