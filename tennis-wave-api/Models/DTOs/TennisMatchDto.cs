namespace tennis_wave_api.Models.DTOs;

public class TennisMatchDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime MatchTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string MatchType { get; set; } = string.Empty;
    public string SkillLevel { get; set; } = string.Empty;
    public int MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Creator information
    public int CreatorId { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public string CreatorAvatar { get; set; } = string.Empty;
}

public class CreateTennisMatchDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime MatchTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string MatchType { get; set; } = string.Empty;
    public string SkillLevel { get; set; } = string.Empty;
    public int MaxParticipants { get; set; } = 2;
}

public class UpdateTennisMatchDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime MatchTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string MatchType { get; set; } = string.Empty;
    public string SkillLevel { get; set; } = string.Empty;
    public int MaxParticipants { get; set; }
    public string Status { get; set; } = string.Empty;
}