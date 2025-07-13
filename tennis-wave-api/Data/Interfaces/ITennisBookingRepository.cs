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
    
    // Advanced search methods
    Task<(List<TennisBooking> Bookings, int TotalCount)> SearchBookingsAsync(
        string? keyword = null,
        string? location = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        TimeSpan? startTime = null,
        TimeSpan? endTime = null,
        BookingType? type = null,
        BookingStatus? status = null,
        SkillLevel? minSkillLevel = null,
        SkillLevel? maxSkillLevel = null,
        int? minParticipants = null,
        int? maxParticipants = null,
        bool? hasAvailableSlots = null,
        double? latitude = null,
        double? longitude = null,
        double? radiusKm = null,
        int? creatorId = null,
        bool? isMyBooking = null,
        bool? isParticipating = null,
        bool? isFlexible = null,
        string? sortBy = null,
        bool? sortDescending = null,
        int page = 1,
        int pageSize = 20);
    
    Task<Dictionary<string, object>> GetBookingStatisticsAsync();
    
    Task<TennisBooking> CreateAsync(TennisBooking booking);
    Task<TennisBooking> UpdateAsync(TennisBooking booking);
    Task<bool> DeleteAsync(int id);
    
    // Participant management
    Task<BookingParticipant?> GetParticipantAsync(int bookingId, int userId);
    Task<BookingParticipant> AddParticipantAsync(BookingParticipant participant);
    Task<BookingParticipant> UpdateParticipantAsync(BookingParticipant participant);
    Task<bool> RemoveParticipantAsync(int bookingId, int userId);
    Task<List<BookingParticipant>> GetParticipantsByBookingIdAsync(int bookingId);
    Task<List<BookingParticipant>> GetParticipantsByUserIdAsync(int userId);
    
    // Request methods
    Task<BookingRequest?> GetRequestAsync(int requestId);
    Task<BookingRequest> CreateRequestAsync(BookingRequest request);
    Task<BookingRequest> UpdateRequestAsync(BookingRequest request);
    Task<List<BookingRequest>> GetRequestsByBookingIdAsync(int bookingId);
    Task<List<BookingRequest>> GetRequestsByRequesterIdAsync(int requesterId);
    
    // Pagination methods
    Task<(List<TennisBooking> Bookings, int TotalCount)> GetBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<(List<TennisBooking> Bookings, int TotalCount)> GetAvailableBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<(List<TennisBooking> Bookings, int TotalCount)> GetBookingsByCreatorWithPaginationAsync(int creatorId, int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<(List<TennisBooking> Bookings, int TotalCount)> GetRecommendedBookingsWithPaginationAsync(int userId, int page, int pageSize);
} 