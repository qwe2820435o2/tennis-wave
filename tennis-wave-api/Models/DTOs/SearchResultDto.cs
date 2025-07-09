namespace tennis_wave_api.Models.DTOs;

/// <summary>
/// Search result DTO with pagination
/// </summary>
public class SearchResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Tennis booking search result
/// </summary>
public class TennisBookingSearchResultDto : SearchResultDto<TennisBookingDto>
{
    public Dictionary<string, int> TypeCounts { get; set; } = new();
    public Dictionary<string, int> StatusCounts { get; set; } = new();
    public Dictionary<string, int> SkillLevelCounts { get; set; } = new();
    public List<string> AvailableLocations { get; set; } = new();
} 