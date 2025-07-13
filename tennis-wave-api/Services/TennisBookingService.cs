using AutoMapper;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Models.Enums;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Services;

/// <summary>
/// Tennis booking service implementation
/// </summary>
public class TennisBookingService : ITennisBookingService
{
    private readonly ITennisBookingRepository _bookingRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public TennisBookingService(
        ITennisBookingRepository bookingRepository,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _bookingRepository = bookingRepository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<List<TennisBookingDto>> GetAllBookingsAsync()
    {
        var bookings = await _bookingRepository.GetAllAsync();
        return _mapper.Map<List<TennisBookingDto>>(bookings);
    }

    public async Task<TennisBookingDto?> GetBookingByIdAsync(int id)
    {
        var booking = await _bookingRepository.GetByIdAsync(id);
        return _mapper.Map<TennisBookingDto>(booking);
    }

    public async Task<List<TennisBookingDto>> GetMyBookingsAsync(int userId)
    {
        var bookings = await _bookingRepository.GetByCreatorIdAsync(userId);
        return _mapper.Map<List<TennisBookingDto>>(bookings);
    }

    public async Task<List<TennisBookingDto>> GetAvailableBookingsAsync()
    {
        var bookings = await _bookingRepository.GetAvailableBookingsAsync();
        return _mapper.Map<List<TennisBookingDto>>(bookings);
    }

    public async Task<List<TennisBookingDto>> GetBookingsByTypeAsync(BookingType type)
    {
        var bookings = await _bookingRepository.GetByTypeAsync(type);
        return _mapper.Map<List<TennisBookingDto>>(bookings);
    }

    public async Task<List<TennisBookingDto>> GetBookingsByStatusAsync(BookingStatus status)
    {
        var bookings = await _bookingRepository.GetByStatusAsync(status);
        return _mapper.Map<List<TennisBookingDto>>(bookings);
    }

    public async Task<List<TennisBookingDto>> GetBookingsByLocationAsync(string location)
    {
        var bookings = await _bookingRepository.GetByLocationAsync(location);
        return _mapper.Map<List<TennisBookingDto>>(bookings);
    }

    /// <summary>
    /// Advanced search for tennis bookings
    /// </summary>
    public async Task<TennisBookingSearchResultDto> SearchBookingsAsync(SearchBookingDto searchDto, int userId)
    {
        var (bookings, totalCount) = await _bookingRepository.SearchBookingsAsync(
            keyword: searchDto.Keyword,
            location: searchDto.Location,
            startDate: searchDto.StartDate,
            endDate: searchDto.EndDate,
            startTime: searchDto.StartTime,
            endTime: searchDto.EndTime,
            type: searchDto.Type,
            status: searchDto.Status,
            minSkillLevel: searchDto.MinSkillLevel,
            maxSkillLevel: searchDto.MaxSkillLevel,
            minParticipants: searchDto.MinParticipants,
            maxParticipants: searchDto.MaxParticipants,
            hasAvailableSlots: searchDto.HasAvailableSlots,
            latitude: searchDto.Latitude,
            longitude: searchDto.Longitude,
            radiusKm: searchDto.RadiusKm,
            creatorId: searchDto.CreatorId ?? (searchDto.IsMyBooking == true ? userId : null),
            isMyBooking: searchDto.IsMyBooking,
            isParticipating: searchDto.IsParticipating,
            isFlexible: searchDto.IsFlexible,
            sortBy: searchDto.SortBy,
            sortDescending: searchDto.SortDescending,
            page: searchDto.Page,
            pageSize: searchDto.PageSize);

        var bookingDtos = _mapper.Map<List<TennisBookingDto>>(bookings);
        
        var result = new TennisBookingSearchResultDto
        {
            Items = bookingDtos,
            TotalCount = totalCount,
            Page = searchDto.Page,
            PageSize = searchDto.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / searchDto.PageSize),
            HasNextPage = searchDto.Page < (int)Math.Ceiling((double)totalCount / searchDto.PageSize),
            HasPreviousPage = searchDto.Page > 1
        };

        // Add statistics
        var stats = await _bookingRepository.GetBookingStatisticsAsync();
        result.TypeCounts = stats.ContainsKey("typeStats") ? (Dictionary<string, int>)stats["typeStats"] : new Dictionary<string, int>();
        result.StatusCounts = stats.ContainsKey("statusStats") ? (Dictionary<string, int>)stats["statusStats"] : new Dictionary<string, int>();
        result.SkillLevelCounts = stats.ContainsKey("skillLevelStats") ? (Dictionary<string, int>)stats["skillLevelStats"] : new Dictionary<string, int>();
        result.AvailableLocations = stats.ContainsKey("availableLocations") ? (List<string>)stats["availableLocations"] : new List<string>();

        return result;
    }

    public async Task<TennisBookingDto> CreateBookingAsync(CreateBookingDto dto, int userId)
    {
        var booking = _mapper.Map<TennisBooking>(dto);
        booking.CreatorId = userId;
        booking.Status = BookingStatus.Pending;
        booking.CurrentParticipants = 1;
        booking.CreatedAt = DateTime.UtcNow;

        var createdBooking = await _bookingRepository.CreateAsync(booking);
        return _mapper.Map<TennisBookingDto>(createdBooking);
    }

    public async Task<TennisBookingDto> UpdateBookingAsync(int id, UpdateBookingDto dto, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
            throw new BusinessException("Booking not found", "BOOKING_NOT_FOUND");

        if (booking.CreatorId != userId)
            throw new BusinessException("You can only update your own bookings", "UNAUTHORIZED");

        _mapper.Map(dto, booking);
        booking.UpdatedAt = DateTime.UtcNow;

        var updatedBooking = await _bookingRepository.UpdateAsync(booking);
        return _mapper.Map<TennisBookingDto>(updatedBooking);
    }

    public async Task<bool> DeleteBookingAsync(int id, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
            return false;

        if (booking.CreatorId != userId)
            throw new BusinessException("You can only delete your own bookings", "UNAUTHORIZED");

        return await _bookingRepository.DeleteAsync(id);
    }

    public async Task<bool> JoinBookingAsync(int bookingId, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            return false;

        if (booking.CreatorId == userId)
            throw new BusinessException("You cannot join your own booking", "CANNOT_JOIN_OWN_BOOKING");

        if (booking.Status != BookingStatus.Pending)
            throw new BusinessException("Booking is not available for joining", "BOOKING_NOT_AVAILABLE");

        if (booking.CurrentParticipants >= booking.MaxParticipants)
            throw new BusinessException("Booking is full", "BOOKING_FULL");

        var existingParticipant = await _bookingRepository.GetParticipantAsync(bookingId, userId);
        if (existingParticipant != null)
            throw new BusinessException("You are already a participant", "ALREADY_PARTICIPANT");

        var participant = new BookingParticipant
        {
            BookingId = bookingId,
            UserId = userId,
            Status = ParticipantStatus.Pending,
            JoinedAt = DateTime.UtcNow
        };

        await _bookingRepository.AddParticipantAsync(participant);

        // Update booking participant count
        booking.CurrentParticipants++;
        await _bookingRepository.UpdateAsync(booking);

        return true;
    }

    public async Task<bool> LeaveBookingAsync(int bookingId, int userId)
    {
        var participant = await _bookingRepository.GetParticipantAsync(bookingId, userId);
        if (participant == null)
            return false;

        await _bookingRepository.RemoveParticipantAsync(bookingId, userId);

        // Update booking participant count
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking != null)
        {
            booking.CurrentParticipants--;
            await _bookingRepository.UpdateAsync(booking);
        }

        return true;
    }

    public async Task<bool> ConfirmParticipantAsync(int bookingId, int participantId, int creatorId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.CreatorId != creatorId)
            return false;

        var participant = await _bookingRepository.GetParticipantAsync(bookingId, participantId);
        if (participant == null)
            return false;

        participant.Status = ParticipantStatus.Confirmed;
        participant.ConfirmedAt = DateTime.UtcNow;
        await _bookingRepository.UpdateParticipantAsync(participant);

        return true;
    }

    public async Task<bool> DeclineParticipantAsync(int bookingId, int participantId, int creatorId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.CreatorId != creatorId)
            return false;

        var participant = await _bookingRepository.GetParticipantAsync(bookingId, participantId);
        if (participant == null)
            return false;

        participant.Status = ParticipantStatus.Declined;
        await _bookingRepository.UpdateParticipantAsync(participant);

        // Update booking participant count
        booking.CurrentParticipants--;
        await _bookingRepository.UpdateAsync(booking);

        return true;
    }

    public async Task<bool> RequestToJoinAsync(int bookingId, int userId, string message)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            return false;

        if (booking.CreatorId == userId)
            throw new BusinessException("You cannot request to join your own booking", "CANNOT_REQUEST_OWN_BOOKING");

        var existingRequest = await _bookingRepository.GetRequestsByBookingIdAsync(bookingId);
        if (existingRequest.Any(r => r.RequesterId == userId && r.Status == RequestStatus.Pending))
            throw new BusinessException("You already have a pending request for this booking", "REQUEST_ALREADY_EXISTS");

        var request = new BookingRequest
        {
            BookingId = bookingId,
            RequesterId = userId,
            Message = message,
            Status = RequestStatus.Pending,
            RequestedAt = DateTime.UtcNow
        };

        await _bookingRepository.CreateRequestAsync(request);
        return true;
    }

    public async Task<bool> RespondToRequestAsync(int requestId, RequestStatus status, string? responseMessage, int userId)
    {
        var request = await _bookingRepository.GetRequestAsync(requestId);
        if (request == null)
            return false;

        var booking = await _bookingRepository.GetByIdAsync(request.BookingId);
        if (booking == null || booking.CreatorId != userId)
            return false;

        request.Status = status;
        request.ResponseMessage = responseMessage;
        request.RespondedAt = DateTime.UtcNow;

        await _bookingRepository.UpdateRequestAsync(request);

        if (status == RequestStatus.Accepted)
        {
            await JoinBookingAsync(request.BookingId, request.RequesterId);
        }

        return true;
    }

    public async Task<List<BookingRequestDto>> GetRequestsByBookingIdAsync(int bookingId, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.CreatorId != userId)
            return new List<BookingRequestDto>();

        var requests = await _bookingRepository.GetRequestsByBookingIdAsync(bookingId);
        return _mapper.Map<List<BookingRequestDto>>(requests);
    }

    public async Task<List<BookingRequestDto>> GetMyRequestsAsync(int userId)
    {
        var requests = await _bookingRepository.GetRequestsByRequesterIdAsync(userId);
        return _mapper.Map<List<BookingRequestDto>>(requests);
    }

    public async Task<List<TennisBookingDto>> GetRecommendedBookingsAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null) return new List<TennisBookingDto>();

        var allBookings = await _bookingRepository.GetAvailableBookingsAsync();
        var recommended = allBookings
            .Where(b => b.CreatorId != userId)
            .Select(b => new
            {
                Booking = b,
                LevelMatch = !string.IsNullOrEmpty(user.TennisLevel) && 
                            (b.MinSkillLevel.ToString() == user.TennisLevel || b.MaxSkillLevel.ToString() == user.TennisLevel),
                LocationMatch = !string.IsNullOrEmpty(user.PreferredLocation) && b.Location.Contains(user.PreferredLocation)
            })
            .OrderByDescending(x => x.LevelMatch)
            .ThenByDescending(x => x.LocationMatch)
            .ThenBy(x => x.Booking.BookingTime)
            .Take(10)
            .Select(x => x.Booking)
            .ToList();

        return _mapper.Map<List<TennisBookingDto>>(recommended);
    }

    public async Task<Dictionary<string, object>> GetBookingStatisticsAsync()
    {
        return await _bookingRepository.GetBookingStatisticsAsync();
    }

    // Pagination methods
    public async Task<TennisBookingSearchResultDto> GetBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var (bookings, totalCount) = await _bookingRepository.GetBookingsWithPaginationAsync(page, pageSize, sortBy, sortDescending);
        var bookingDtos = _mapper.Map<List<TennisBookingDto>>(bookings);
        
        var result = new TennisBookingSearchResultDto
        {
            Items = bookingDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            HasNextPage = page < (int)Math.Ceiling((double)totalCount / pageSize),
            HasPreviousPage = page > 1
        };

        // Add statistics
        var stats = await _bookingRepository.GetBookingStatisticsAsync();
        result.TypeCounts = stats.ContainsKey("typeStats") ? (Dictionary<string, int>)stats["typeStats"] : new Dictionary<string, int>();
        result.StatusCounts = stats.ContainsKey("statusStats") ? (Dictionary<string, int>)stats["statusStats"] : new Dictionary<string, int>();
        result.SkillLevelCounts = stats.ContainsKey("skillLevelStats") ? (Dictionary<string, int>)stats["skillLevelStats"] : new Dictionary<string, int>();
        result.AvailableLocations = stats.ContainsKey("availableLocations") ? (List<string>)stats["availableLocations"] : new List<string>();

        return result;
    }

    public async Task<TennisBookingSearchResultDto> GetAvailableBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var (bookings, totalCount) = await _bookingRepository.GetAvailableBookingsWithPaginationAsync(page, pageSize, sortBy, sortDescending);
        var bookingDtos = _mapper.Map<List<TennisBookingDto>>(bookings);
        
        var result = new TennisBookingSearchResultDto
        {
            Items = bookingDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            HasNextPage = page < (int)Math.Ceiling((double)totalCount / pageSize),
            HasPreviousPage = page > 1
        };

        // Add statistics
        var stats = await _bookingRepository.GetBookingStatisticsAsync();
        result.TypeCounts = stats.ContainsKey("typeStats") ? (Dictionary<string, int>)stats["typeStats"] : new Dictionary<string, int>();
        result.StatusCounts = stats.ContainsKey("statusStats") ? (Dictionary<string, int>)stats["statusStats"] : new Dictionary<string, int>();
        result.SkillLevelCounts = stats.ContainsKey("skillLevelStats") ? (Dictionary<string, int>)stats["skillLevelStats"] : new Dictionary<string, int>();
        result.AvailableLocations = stats.ContainsKey("availableLocations") ? (List<string>)stats["availableLocations"] : new List<string>();

        return result;
    }

    public async Task<TennisBookingSearchResultDto> GetMyBookingsWithPaginationAsync(int userId, int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var (bookings, totalCount) = await _bookingRepository.GetBookingsByCreatorWithPaginationAsync(userId, page, pageSize, sortBy, sortDescending);
        var bookingDtos = _mapper.Map<List<TennisBookingDto>>(bookings);
        
        var result = new TennisBookingSearchResultDto
        {
            Items = bookingDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            HasNextPage = page < (int)Math.Ceiling((double)totalCount / pageSize),
            HasPreviousPage = page > 1
        };

        // Add statistics
        var stats = await _bookingRepository.GetBookingStatisticsAsync();
        result.TypeCounts = stats.ContainsKey("typeStats") ? (Dictionary<string, int>)stats["typeStats"] : new Dictionary<string, int>();
        result.StatusCounts = stats.ContainsKey("statusStats") ? (Dictionary<string, int>)stats["statusStats"] : new Dictionary<string, int>();
        result.SkillLevelCounts = stats.ContainsKey("skillLevelStats") ? (Dictionary<string, int>)stats["skillLevelStats"] : new Dictionary<string, int>();
        result.AvailableLocations = stats.ContainsKey("availableLocations") ? (List<string>)stats["availableLocations"] : new List<string>();

        return result;
    }

    public async Task<TennisBookingSearchResultDto> GetRecommendedBookingsWithPaginationAsync(int userId, int page, int pageSize)
    {
        var (bookings, totalCount) = await _bookingRepository.GetRecommendedBookingsWithPaginationAsync(userId, page, pageSize);
        var bookingDtos = _mapper.Map<List<TennisBookingDto>>(bookings);
        
        var result = new TennisBookingSearchResultDto
        {
            Items = bookingDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            HasNextPage = page < (int)Math.Ceiling((double)totalCount / pageSize),
            HasPreviousPage = page > 1
        };

        // Add statistics
        var stats = await _bookingRepository.GetBookingStatisticsAsync();
        result.TypeCounts = stats.ContainsKey("typeStats") ? (Dictionary<string, int>)stats["typeStats"] : new Dictionary<string, int>();
        result.StatusCounts = stats.ContainsKey("statusStats") ? (Dictionary<string, int>)stats["statusStats"] : new Dictionary<string, int>();
        result.SkillLevelCounts = stats.ContainsKey("skillLevelStats") ? (Dictionary<string, int>)stats["skillLevelStats"] : new Dictionary<string, int>();
        result.AvailableLocations = stats.ContainsKey("availableLocations") ? (List<string>)stats["availableLocations"] : new List<string>();

        return result;
    }
}