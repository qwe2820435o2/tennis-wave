using System;
using System.Collections.Generic;

namespace tennis_wave_api.Models.Entities;

public partial class MatchParticipant
{
    public int Id { get; set; }

    public int MatchId { get; set; }

    public int UserId { get; set; }

    public string Role { get; set; } = null!;

    public DateTime JoinedAt { get; set; }
    
    public virtual TennisMatch Match { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
