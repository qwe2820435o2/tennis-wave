namespace tennis_wave_api.Models.DTOs;

/// <summary>
/// User search DTO with pagination
/// </summary>
public class UserSearchDto : PaginationDto
{
    public int UserId { get; set; }
    public string? Keyword { get; set; }
    public string? TennisLevel { get; set; }
    public string? PreferredLocation { get; set; }
    public int? ExcludeUserId { get; set; }
}

/// <summary>
/// User search result DTO
/// </summary>
public class UserSearchResultDto : PaginatedResultDto<UserDto>
{
    public Dictionary<string, int> LevelCounts { get; set; } = new();
    public Dictionary<string, int> LocationCounts { get; set; } = new();
    public List<string> AvailableLevels { get; set; } = new();
    public List<string> AvailableLocations { get; set; } = new();
}