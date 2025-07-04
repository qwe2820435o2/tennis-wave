using System;
using System.Collections.Generic;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Models.DTOs;

/// <summary>
/// Tennis booking DTO
/// </summary>
public class TennisBookingDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime BookingTime { get; set; }
    public string Location { get; set; } = null!;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public BookingType Type { get; set; }
    public BookingStatus Status { get; set; }
    public SkillLevel MinSkillLevel { get; set; }
    public SkillLevel MaxSkillLevel { get; set; }
    public int MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public bool IsFlexible { get; set; }
    public string? PreferredTimeSlots { get; set; }
    public string? ContactInfo { get; set; }
    public string? AdditionalNotes { get; set; }
    public int CreatorId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public UserDto Creator { get; set; } = null!;
    public List<BookingParticipantDto> Participants { get; set; } = new();
    public List<BookingRequestDto> Requests { get; set; } = new();
}

/// <summary>
/// Create tennis booking DTO
/// </summary>
public class CreateBookingDto
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime BookingTime { get; set; }
    public string Location { get; set; } = null!;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public BookingType Type { get; set; }
    public SkillLevel MinSkillLevel { get; set; }
    public SkillLevel MaxSkillLevel { get; set; }
    public int MaxParticipants { get; set; }
    public bool IsFlexible { get; set; }
    public string? PreferredTimeSlots { get; set; }
    public string? ContactInfo { get; set; }
    public string? AdditionalNotes { get; set; }
}

/// <summary>
/// Update tennis booking DTO
/// </summary>
public class UpdateBookingDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? BookingTime { get; set; }
    public string? Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public BookingType? Type { get; set; }
    public SkillLevel? MinSkillLevel { get; set; }
    public SkillLevel? MaxSkillLevel { get; set; }
    public int? MaxParticipants { get; set; }
    public bool? IsFlexible { get; set; }
    public string? PreferredTimeSlots { get; set; }
    public string? ContactInfo { get; set; }
    public string? AdditionalNotes { get; set; }
}

/// <summary>
/// Booking participant DTO
/// </summary>
public class BookingParticipantDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int UserId { get; set; }
    public ParticipantStatus Status { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public UserDto User { get; set; } = null!;
}

/// <summary>
/// Booking request DTO
/// </summary>
public class BookingRequestDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int RequesterId { get; set; }
    public string Message { get; set; } = null!;
    public RequestStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public string? ResponseMessage { get; set; }
    public UserDto Requester { get; set; } = null!;
}

/// <summary>
/// Create booking request DTO
/// </summary>
public class CreateBookingRequestDto
{
    public int BookingId { get; set; }
    public string Message { get; set; } = null!;
}

/// <summary>
/// Respond to booking request DTO
/// </summary>
public class RespondToRequestDto
{
    public RequestStatus Status { get; set; }
    public string? ResponseMessage { get; set; }
} 