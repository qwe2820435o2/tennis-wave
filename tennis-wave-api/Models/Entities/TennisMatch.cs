using System;
using System.Collections.Generic;

namespace tennis_wave_api.Models.Entities;

public partial class TennisMatch
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public DateTime MatchTime { get; set; }

    public string Location { get; set; } = null!;

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string MatchType { get; set; } = null!;

    public string SkillLevel { get; set; } = null!;

    public int MaxParticipants { get; set; }

    public int CurrentParticipants { get; set; }

    public int CreatorId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
    
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<MatchParticipant> Participants { get; set; } = new List<MatchParticipant>();
}
