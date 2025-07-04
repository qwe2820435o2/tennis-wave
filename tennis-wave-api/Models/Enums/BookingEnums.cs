namespace tennis_wave_api.Models.Enums;

/// <summary>
/// Tennis booking type enumeration
/// </summary>
public enum BookingType
{
    Casual = 1,        // Casual tennis
    Training = 2,      // Training session
    Competition = 3,   // Competition match
    Doubles = 4,       // Doubles match
    Singles = 5,       // Singles match
    Mixed = 6          // Mixed doubles
}

/// <summary>
/// Tennis booking status enumeration
/// </summary>
public enum BookingStatus
{
    Pending = 1,       // Waiting for confirmation
    Confirmed = 2,     // Confirmed
    InProgress = 3,    // In progress
    Completed = 4,     // Completed
    Cancelled = 5,     // Cancelled
    Expired = 6        // Expired
}

/// <summary>
/// Participant status enumeration
/// </summary>
public enum ParticipantStatus
{
    Pending = 1,       // Waiting for confirmation
    Confirmed = 2,     // Confirmed
    Declined = 3,      // Declined
    Cancelled = 4      // Cancelled
}

/// <summary>
/// Request status enumeration
/// </summary>
public enum RequestStatus
{
    Pending = 1,       // Pending
    Accepted = 2,      // Accepted
    Rejected = 3,      // Rejected
    Cancelled = 4      // Cancelled
}

/// <summary>
/// Skill level enumeration
/// </summary>
public enum SkillLevel
{
    Beginner = 1,      // Beginner
    Intermediate = 2,  // Intermediate
    Advanced = 3,      // Advanced
    Professional = 4   // Professional
} 