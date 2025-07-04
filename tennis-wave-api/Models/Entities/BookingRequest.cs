using System;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Models.Entities;

/// <summary>
/// Tennis booking request entity
/// </summary>
public partial class BookingRequest
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int RequesterId { get; set; }
    public string Message { get; set; } = null!;
    public RequestStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public string? ResponseMessage { get; set; }
    
    // Navigation properties
    public virtual TennisBooking Booking { get; set; } = null!;
    public virtual User Requester { get; set; } = null!;
} 