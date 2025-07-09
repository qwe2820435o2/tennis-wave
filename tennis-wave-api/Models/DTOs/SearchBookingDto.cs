using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Models.DTOs;

/// <summary>
/// Advanced search DTO for tennis bookings
/// </summary>
public class SearchBookingDto
{
    // Basic search
    public string? Keyword { get; set; }
    public string? Location { get; set; }
    
    // Time filters
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    
    // Type and status filters
    public BookingType? Type { get; set; }
    public BookingStatus? Status { get; set; }
    
    // Skill level filters
    public SkillLevel? MinSkillLevel { get; set; }
    public SkillLevel? MaxSkillLevel { get; set; }
    
    // Participant filters
    public int? MinParticipants { get; set; }
    public int? MaxParticipants { get; set; }
    public bool? HasAvailableSlots { get; set; }
    
    // Location filters
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? RadiusKm { get; set; }
    
    // Creator filters
    public int? CreatorId { get; set; }
    public bool? IsMyBooking { get; set; }
    public bool? IsParticipating { get; set; }
    
    // Sorting
    public string? SortBy { get; set; } // "time", "distance", "skill", "participants"
    public bool? SortDescending { get; set; }
    
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    
    // Additional filters
    public bool? IsFlexible { get; set; }
    public string? PreferredTimeSlots { get; set; }
} 