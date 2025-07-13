using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using tennis_wave_api.Extensions;
using tennis_wave_api.Helpers;
using tennis_wave_api.Models;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Enums;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Controllers;

/// <summary>
/// Tennis booking controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TennisBookingController : ControllerBase
{
    private readonly ITennisBookingService _bookingService;

    public TennisBookingController(ITennisBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    /// <summary>
    /// Get all tennis bookings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetAllBookings()
    {
        try
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(ApiResponseHelper.Success(bookings));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisBookingDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get tennis bookings with pagination
    /// </summary>
    [HttpGet("paginated")]
    public async Task<ActionResult<ApiResponse<TennisBookingSearchResultDto>>> GetBookingsWithPagination(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        try
        {
            var result = await _bookingService.GetBookingsWithPaginationAsync(page, pageSize, sortBy, sortDescending);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingSearchResultDto>(ex.Message));
        }
    }

    /// <summary>
/// Get available tennis bookings with pagination
/// </summary>
[HttpGet("available")]
[AllowAnonymous] 
public async Task<ActionResult<ApiResponse<TennisBookingSearchResultDto>>> GetAvailableBookingsWithPagination(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? sortBy = null,
    [FromQuery] bool sortDescending = false)
    {
        try
        {
            var result = await _bookingService.GetAvailableBookingsWithPaginationAsync(page, pageSize, sortBy, sortDescending);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingSearchResultDto>(ex.Message));
        }
    }

    /// <summary>
    /// Get my tennis bookings with pagination
    /// </summary>
    [HttpGet("my-bookings")]
    public async Task<ActionResult<ApiResponse<TennisBookingSearchResultDto>>> GetMyBookingsWithPagination(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _bookingService.GetMyBookingsWithPaginationAsync(userId, page, pageSize, sortBy, sortDescending);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingSearchResultDto>(ex.Message));
        }
    }

    /// <summary>
    /// Get recommended tennis bookings with pagination
    /// </summary>
    [HttpGet("recommended")]
    public async Task<ActionResult<ApiResponse<TennisBookingSearchResultDto>>> GetRecommendedBookingsWithPagination(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _bookingService.GetRecommendedBookingsWithPaginationAsync(userId, page, pageSize);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingSearchResultDto>(ex.Message));
        }
    }

    /// <summary>
    /// Get tennis booking by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TennisBookingDto>>> GetBookingById(int id)
    {
        try
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            if (booking == null)
                return NotFound(ApiResponseHelper.Fail<TennisBookingDto>("Booking not found"));

            return Ok(ApiResponseHelper.Success(booking));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingDto>(ex.Message));
        }
    }



    /// <summary>
    /// Get tennis bookings by type
    /// </summary>
    [HttpGet("by-type/{type}")]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetBookingsByType(BookingType type)
    {
        try
        {
            var bookings = await _bookingService.GetBookingsByTypeAsync(type);
            return Ok(ApiResponseHelper.Success(bookings));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisBookingDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get tennis bookings by status
    /// </summary>
    [HttpGet("by-status/{status}")]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetBookingsByStatus(BookingStatus status)
    {
        try
        {
            var bookings = await _bookingService.GetBookingsByStatusAsync(status);
            return Ok(ApiResponseHelper.Success(bookings));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisBookingDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get tennis bookings by location
    /// </summary>
    [HttpGet("by-location")]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetBookingsByLocation([FromQuery] string location)
    {
        try
        {
            var bookings = await _bookingService.GetBookingsByLocationAsync(location);
            return Ok(ApiResponseHelper.Success(bookings));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisBookingDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Create a new tennis booking
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TennisBookingDto>>> CreateBooking([FromBody] CreateBookingDto createBookingDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var booking = await _bookingService.CreateBookingAsync(createBookingDto, userId);
            return Ok(ApiResponseHelper.Success(booking, "Booking created successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingDto>(ex.Message));
        }
    }

    /// <summary>
    /// Update a tennis booking
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TennisBookingDto>>> UpdateBooking(int id, [FromBody] UpdateBookingDto updateBookingDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var booking = await _bookingService.UpdateBookingAsync(id, updateBookingDto, userId);
            return Ok(ApiResponseHelper.Success(booking, "Booking updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingDto>(ex.Message));
        }
    }

    /// <summary>
    /// Delete a tennis booking
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteBooking(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _bookingService.DeleteBookingAsync(id, userId);
            if (success)
                return Ok(ApiResponseHelper.Success(true, "Booking deleted successfully"));
            else
                return NotFound(ApiResponseHelper.Fail<bool>("Booking not found"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Join a tennis booking
    /// </summary>
    [HttpPost("{id}/join")]
    public async Task<ActionResult<ApiResponse<bool>>> JoinBooking(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _bookingService.JoinBookingAsync(id, userId);
            if (success)
                return Ok(ApiResponseHelper.Success(true, "Successfully joined the booking"));
            else
                return BadRequest(ApiResponseHelper.Fail<bool>("Failed to join the booking"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Leave a tennis booking
    /// </summary>
    [HttpPost("{id}/leave")]
    public async Task<ActionResult<ApiResponse<bool>>> LeaveBooking(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _bookingService.LeaveBookingAsync(id, userId);
            if (success)
                return Ok(ApiResponseHelper.Success(true, "Successfully left the booking"));
            else
                return BadRequest(ApiResponseHelper.Fail<bool>("Failed to leave the booking"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Confirm a participant
    /// </summary>
    [HttpPost("{bookingId}/participants/{participantId}/confirm")]
    public async Task<ActionResult<ApiResponse<bool>>> ConfirmParticipant(int bookingId, int participantId)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _bookingService.ConfirmParticipantAsync(bookingId, participantId, userId);
            if (success)
                return Ok(ApiResponseHelper.Success(true, "Participant confirmed successfully"));
            else
                return BadRequest(ApiResponseHelper.Fail<bool>("Failed to confirm participant"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Decline a participant
    /// </summary>
    [HttpPost("{bookingId}/participants/{participantId}/decline")]
    public async Task<ActionResult<ApiResponse<bool>>> DeclineParticipant(int bookingId, int participantId)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _bookingService.DeclineParticipantAsync(bookingId, participantId, userId);
            if (success)
                return Ok(ApiResponseHelper.Success(true, "Participant declined successfully"));
            else
                return BadRequest(ApiResponseHelper.Fail<bool>("Failed to decline participant"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Request to join a tennis booking
    /// </summary>
    [HttpPost("{id}/request")]
    public async Task<ActionResult<ApiResponse<bool>>> RequestToJoin(int id, [FromBody] CreateBookingRequestDto requestDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _bookingService.RequestToJoinAsync(id, userId, requestDto.Message);
            if (success)
                return Ok(ApiResponseHelper.Success(true, "Request sent successfully"));
            else
                return BadRequest(ApiResponseHelper.Fail<bool>("Failed to send request"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Respond to a join request
    /// </summary>
    [HttpPost("requests/{requestId}/respond")]
    public async Task<ActionResult<ApiResponse<bool>>> RespondToRequest(int requestId, [FromBody] RespondToRequestDto responseDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var success = await _bookingService.RespondToRequestAsync(requestId, responseDto.Status, responseDto.ResponseMessage, userId);
            if (success)
                return Ok(ApiResponseHelper.Success(true, "Response sent successfully"));
            else
                return BadRequest(ApiResponseHelper.Fail<bool>("Failed to send response"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Get requests for a booking
    /// </summary>
    [HttpGet("{bookingId}/requests")]
    public async Task<ActionResult<ApiResponse<List<BookingRequestDto>>>> GetRequestsByBookingId(int bookingId)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var requests = await _bookingService.GetRequestsByBookingIdAsync(bookingId, userId);
            return Ok(ApiResponseHelper.Success(requests));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<BookingRequestDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get my requests
    /// </summary>
    [HttpGet("my-requests")]
    public async Task<ActionResult<ApiResponse<List<BookingRequestDto>>>> GetMyRequests()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var requests = await _bookingService.GetMyRequestsAsync(userId);
            return Ok(ApiResponseHelper.Success(requests));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<BookingRequestDto>>(ex.Message));
        }
    }



    /// <summary>
    /// Advanced search for tennis bookings
    /// </summary>
    [HttpPost("search")]
    public async Task<ActionResult<ApiResponse<TennisBookingSearchResultDto>>> SearchBookings([FromBody] SearchBookingDto searchDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _bookingService.SearchBookingsAsync(searchDto, userId);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingSearchResultDto>(ex.Message));
        }
    }

    /// <summary>
    /// Get booking statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<Dictionary<string, object>>>> GetBookingStatistics()
    {
        try
        {
            var statistics = await _bookingService.GetBookingStatisticsAsync();
            return Ok(ApiResponseHelper.Success(statistics));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<Dictionary<string, object>>(ex.Message));
        }
    }
} 