using System;
using System.Collections.Generic;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Models.Entities;

/// <summary>
/// Tennis booking entity
/// </summary>
public partial class TennisBooking
{
    public int Id { get; set; }
    
    // Basic information
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime BookingTime { get; set; }
    public string Location { get; set; } = null!;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Booking type and status
    public BookingType Type { get; set; }
    public BookingStatus Status { get; set; }
    
    // Skill requirements
    public SkillLevel MinSkillLevel { get; set; }
    public SkillLevel MaxSkillLevel { get; set; }
    
    // Participant management
    public int MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    
    // Time flexibility
    public bool IsFlexible { get; set; }
    public string? PreferredTimeSlots { get; set; }
    
    // Contact information
    public string? ContactInfo { get; set; }
    public string? AdditionalNotes { get; set; }
    
    // Creator information
    public int CreatorId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<BookingParticipant> Participants { get; set; } = new List<BookingParticipant>();
    public virtual ICollection<BookingRequest> Requests { get; set; } = new List<BookingRequest>();
} 