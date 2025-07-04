using tennis_wave_api.Models.Entities;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Data.Interfaces;

/// <summary>
/// Tennis booking repository interface
/// </summary>
public interface ITennisBookingRepository
{
    Task<List<TennisBooking>> GetAllAsync();
    Task<TennisBooking?> GetByIdAsync(int id);
    Task<List<TennisBooking>> GetByCreatorIdAsync(int creatorId);
    Task<List<TennisBooking>> GetByParticipantIdAsync(int participantId);
    Task<List<TennisBooking>> GetByStatusAsync(BookingStatus status);
    Task<List<TennisBooking>> GetByTypeAsync(BookingType type);
    Task<List<TennisBooking>> GetByLocationAsync(string location);
    Task<List<TennisBooking>> GetBySkillLevelAsync(SkillLevel minLevel, SkillLevel maxLevel);
    Task<List<TennisBooking>> GetAvailableBookingsAsync();
    Task<TennisBooking> CreateAsync(TennisBooking booking);
    Task<TennisBooking> UpdateAsync(TennisBooking booking);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    
    // Participant methods
    Task<BookingParticipant?> GetParticipantAsync(int bookingId, int userId);
    Task<BookingParticipant> AddParticipantAsync(BookingParticipant participant);
    Task<BookingParticipant> UpdateParticipantAsync(BookingParticipant participant);
    Task<bool> RemoveParticipantAsync(int bookingId, int userId);
    Task<List<BookingParticipant>> GetParticipantsByBookingIdAsync(int bookingId);
    
    // Request methods
    Task<BookingRequest?> GetRequestAsync(int requestId);
    Task<BookingRequest> CreateRequestAsync(BookingRequest request);
    Task<BookingRequest> UpdateRequestAsync(BookingRequest request);
    Task<List<BookingRequest>> GetRequestsByBookingIdAsync(int bookingId);
    Task<List<BookingRequest>> GetRequestsByRequesterIdAsync(int requesterId);
} 