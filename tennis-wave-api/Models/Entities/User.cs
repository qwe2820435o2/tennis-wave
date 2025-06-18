namespace tennis_wave_api.Models.Entities;

public class User
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string? Avatar { get; set; }
    public string? TennisLevel { get; set; }
    public string? PreferredLocation { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}