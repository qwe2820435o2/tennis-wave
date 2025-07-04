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

    public async Task<TennisBookingDto> CreateBookingAsync(CreateBookingDto dto, int userId)
    {
        // Validate user exists
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
            throw new BusinessException("User not found");

        // Validate booking time is in the future
        if (dto.BookingTime <= DateTime.UtcNow)
            throw new BusinessException("Booking time must be in the future");

        // Validate max participants
        if (dto.MaxParticipants < 1)
            throw new BusinessException("Max participants must be at least 1");

        // Validate skill levels
        if (dto.MinSkillLevel > dto.MaxSkillLevel)
            throw new BusinessException("Min skill level cannot be higher than max skill level");

        // Use AutoMapper to map DTO to entity
        var booking = _mapper.Map<TennisBooking>(dto);
        
        // Set additional properties that are not in the DTO
        booking.Status = BookingStatus.Pending;
        booking.CurrentParticipants = 1; // Creator automatically joins
        booking.CreatorId = userId;
        booking.CreatedAt = DateTime.UtcNow;

        // Creator automatically becomes a confirmed participant
        booking.Participants.Add(new BookingParticipant
        {
            BookingId = booking.Id,
            UserId = userId,
            Status = ParticipantStatus.Confirmed,
            JoinedAt = DateTime.UtcNow,
            ConfirmedAt = DateTime.UtcNow
        });

        var createdBooking = await _bookingRepository.CreateAsync(booking);
        return _mapper.Map<TennisBookingDto>(createdBooking);
    }

    public async Task<TennisBookingDto> UpdateBookingAsync(int id, UpdateBookingDto dto, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.CreatorId != userId)
            throw new BusinessException("Only the creator can update this booking");

        if (booking.Status != BookingStatus.Pending)
            throw new BusinessException("Cannot update booking that is not pending");

        // Validate booking time if provided
        if (dto.BookingTime.HasValue && dto.BookingTime.Value <= DateTime.UtcNow)
            throw new BusinessException("Booking time must be in the future");

        // Validate max participants if provided
        if (dto.MaxParticipants.HasValue && dto.MaxParticipants.Value < booking.CurrentParticipants)
            throw new BusinessException("Max participants cannot be less than current participants");

        // Use AutoMapper to update the booking entity
        _mapper.Map(dto, booking);
        
        // Set updated timestamp
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
            throw new BusinessException("Only the creator can delete this booking");

        if (booking.Status != BookingStatus.Pending)
            throw new BusinessException("Cannot delete booking that is not pending");

        return await _bookingRepository.DeleteAsync(id);
    }

    public async Task<bool> JoinBookingAsync(int bookingId, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.Status != BookingStatus.Pending)
            throw new BusinessException("Booking is not available for joining");

        if (booking.CurrentParticipants >= booking.MaxParticipants)
            throw new BusinessException("Booking is full");

        if (booking.CreatorId == userId)
            throw new BusinessException("Creator is already a participant");

        // Check if user is already a participant
        var existingParticipant = await _bookingRepository.GetParticipantAsync(bookingId, userId);
        if (existingParticipant != null)
            throw new BusinessException("You are already a participant");

        var participant = new BookingParticipant
        {
            BookingId = bookingId,
            UserId = userId,
            Status = ParticipantStatus.Confirmed,
            JoinedAt = DateTime.UtcNow,
            ConfirmedAt = DateTime.UtcNow
        };

        await _bookingRepository.AddParticipantAsync(participant);

        // Update booking participant count
        booking.CurrentParticipants++;
        await _bookingRepository.UpdateAsync(booking);

        return true;
    }

    public async Task<bool> LeaveBookingAsync(int bookingId, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.CreatorId == userId)
            throw new BusinessException("Creator cannot leave their own booking");

        var participant = await _bookingRepository.GetParticipantAsync(bookingId, userId);
        if (participant == null)
            throw new BusinessException("You are not a participant of this booking");

        var success = await _bookingRepository.RemoveParticipantAsync(bookingId, userId);
        if (success)
        {
            // Update booking participant count
            booking.CurrentParticipants--;
            await _bookingRepository.UpdateAsync(booking);
        }

        return success;
    }

    public async Task<bool> ConfirmParticipantAsync(int bookingId, int participantId, int creatorId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.CreatorId != creatorId)
            throw new BusinessException("Only the creator can confirm participants");

        var participant = await _bookingRepository.GetParticipantAsync(bookingId, participantId);
        if (participant == null)
            throw new BusinessException("Participant not found");

        participant.Status = ParticipantStatus.Confirmed;
        participant.ConfirmedAt = DateTime.UtcNow;

        await _bookingRepository.UpdateParticipantAsync(participant);
        return true;
    }

    public async Task<bool> DeclineParticipantAsync(int bookingId, int participantId, int creatorId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.CreatorId != creatorId)
            throw new BusinessException("Only the creator can decline participants");

        var participant = await _bookingRepository.GetParticipantAsync(bookingId, participantId);
        if (participant == null)
            throw new BusinessException("Participant not found");

        var success = await _bookingRepository.RemoveParticipantAsync(bookingId, participantId);
        if (success)
        {
            // Update booking participant count
            booking.CurrentParticipants--;
            await _bookingRepository.UpdateAsync(booking);
        }

        return success;
    }

    public async Task<bool> RequestToJoinAsync(int bookingId, int userId, string message)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.Status != BookingStatus.Pending)
            throw new BusinessException("Booking is not available for requests");

        if (booking.CreatorId == userId)
            throw new BusinessException("Creator cannot request to join their own booking");

        // Check if user is already a participant
        var existingParticipant = await _bookingRepository.GetParticipantAsync(bookingId, userId);
        if (existingParticipant != null)
            throw new BusinessException("You are already a participant");

        // Check if user already has a pending request
        var existingRequests = await _bookingRepository.GetRequestsByRequesterIdAsync(userId);
        if (existingRequests.Any(r => r.BookingId == bookingId && r.Status == RequestStatus.Pending))
            throw new BusinessException("You already have a pending request for this booking");

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
            throw new BusinessException("Request not found");

        var booking = await _bookingRepository.GetByIdAsync(request.BookingId);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.CreatorId != userId)
            throw new BusinessException("Only the creator can respond to requests");

        if (request.Status != RequestStatus.Pending)
            throw new BusinessException("Request has already been processed");

        request.Status = status;
        request.ResponseMessage = responseMessage;
        request.RespondedAt = DateTime.UtcNow;

        await _bookingRepository.UpdateRequestAsync(request);

        // If accepted, add user as participant
        if (status == RequestStatus.Accepted)
        {
            if (booking.CurrentParticipants >= booking.MaxParticipants)
                throw new BusinessException("Booking is full");

            var participant = new BookingParticipant
            {
                BookingId = request.BookingId,
                UserId = request.RequesterId,
                Status = ParticipantStatus.Confirmed,
                JoinedAt = DateTime.UtcNow,
                ConfirmedAt = DateTime.UtcNow
            };

            await _bookingRepository.AddParticipantAsync(participant);

            // Update booking participant count
            booking.CurrentParticipants++;
            await _bookingRepository.UpdateAsync(booking);
        }

        return true;
    }

    public async Task<List<BookingRequestDto>> GetRequestsByBookingIdAsync(int bookingId, int userId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new BusinessException("Booking not found");

        if (booking.CreatorId != userId)
            throw new BusinessException("Only the creator can view requests");

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
        if (user == null)
            return new List<TennisBookingDto>();

        var availableBookings = await _bookingRepository.GetAvailableBookingsAsync();
        
        // Simple recommendation algorithm
        var recommended = availableBookings
            .Where(b => b.CreatorId != userId) // Exclude own bookings
            .Where(b => !b.Participants.Any(p => p.UserId == userId)) // Exclude already joined
            .OrderBy(b => b.BookingTime) // Sort by time
            .Take(10)
            .ToList();

        return _mapper.Map<List<TennisBookingDto>>(recommended);
    }
}