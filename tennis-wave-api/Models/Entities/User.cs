
namespace tennis_wave_api.Models.Entities;

public partial class User
{
    public int Id { get; set; }

    public string UserName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Avatar { get; set; }

    public string? TennisLevel { get; set; }

    public string? PreferredLocation { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Bio { get; set; }
}
