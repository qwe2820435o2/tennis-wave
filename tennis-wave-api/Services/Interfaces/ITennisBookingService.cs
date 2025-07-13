using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Services.Interfaces;

/// <summary>
/// Tennis booking service interface
/// </summary>
public interface ITennisBookingService
{
    Task<List<TennisBookingDto>> GetAllBookingsAsync();
    Task<TennisBookingDto?> GetBookingByIdAsync(int id);
    Task<List<TennisBookingDto>> GetMyBookingsAsync(int userId);
    Task<List<TennisBookingDto>> GetAvailableBookingsAsync();
    Task<List<TennisBookingDto>> GetBookingsByTypeAsync(BookingType type);
    Task<List<TennisBookingDto>> GetBookingsByStatusAsync(BookingStatus status);
    Task<List<TennisBookingDto>> GetBookingsByLocationAsync(string location);
    Task<TennisBookingDto> CreateBookingAsync(CreateBookingDto dto, int userId);
    Task<TennisBookingDto> UpdateBookingAsync(int id, UpdateBookingDto dto, int userId);
    Task<bool> DeleteBookingAsync(int id, int userId);
    
    // Participant management
    Task<bool> JoinBookingAsync(int bookingId, int userId);
    Task<bool> LeaveBookingAsync(int bookingId, int userId);
    Task<bool> ConfirmParticipantAsync(int bookingId, int participantId, int creatorId);
    Task<bool> DeclineParticipantAsync(int bookingId, int participantId, int creatorId);
    
    // Request management
    Task<bool> RequestToJoinAsync(int bookingId, int userId, string message);
    Task<bool> RespondToRequestAsync(int requestId, RequestStatus status, string? responseMessage, int userId);
    Task<List<BookingRequestDto>> GetRequestsByBookingIdAsync(int bookingId, int userId);
    Task<List<BookingRequestDto>> GetMyRequestsAsync(int userId);
    
    // Recommendation system
    Task<List<TennisBookingDto>> GetRecommendedBookingsAsync(int userId);
    
    // Advanced search methods
    Task<TennisBookingSearchResultDto> SearchBookingsAsync(SearchBookingDto searchDto, int userId);
    Task<Dictionary<string, object>> GetBookingStatisticsAsync();
    
    // Pagination methods
    Task<TennisBookingSearchResultDto> GetBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<TennisBookingSearchResultDto> GetAvailableBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<TennisBookingSearchResultDto> GetMyBookingsWithPaginationAsync(int userId, int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<TennisBookingSearchResultDto> GetRecommendedBookingsWithPaginationAsync(int userId, int page, int pageSize);
} 