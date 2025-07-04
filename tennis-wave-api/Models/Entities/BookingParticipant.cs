using System;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Models.Entities;

/// <summary>
/// Tennis booking participant entity
/// </summary>
public partial class BookingParticipant
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int UserId { get; set; }
    public ParticipantStatus Status { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    
    // Navigation properties
    public virtual TennisBooking Booking { get; set; } = null!;
    public virtual User User { get; set; } = null!;
} 