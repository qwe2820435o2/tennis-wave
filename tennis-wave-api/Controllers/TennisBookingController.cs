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
    /// Get my tennis bookings
    /// </summary>
    [HttpGet("my-bookings")]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetMyBookings()
    {
        try
        {
            var userId = GetCurrentUserId();
            var bookings = await _bookingService.GetMyBookingsAsync(userId);
            return Ok(ApiResponseHelper.Success(bookings));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisBookingDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get available tennis bookings
    /// </summary>
    [HttpGet("available")]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetAvailableBookings()
    {
        try
        {
            var bookings = await _bookingService.GetAvailableBookingsAsync();
            return Ok(ApiResponseHelper.Success(bookings));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisBookingDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get bookings by type
    /// </summary>
    [HttpGet("type/{type}")]
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
    /// Get bookings by status
    /// </summary>
    [HttpGet("status/{status}")]
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
    /// Get bookings by location
    /// </summary>
    [HttpGet("location/{location}")]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetBookingsByLocation(string location)
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
    public async Task<ActionResult<ApiResponse<TennisBookingDto>>> CreateBooking([FromBody] CreateBookingDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var booking = await _bookingService.CreateBookingAsync(dto, userId);
            return Ok(ApiResponseHelper.Success(booking, "Booking created successfully"));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingDto>(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingDto>(ex.Message));
        }
    }

    /// <summary>
    /// Update tennis booking
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TennisBookingDto>>> UpdateBooking(int id, [FromBody] UpdateBookingDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var booking = await _bookingService.UpdateBookingAsync(id, dto, userId);
            return Ok(ApiResponseHelper.Success(booking, "Booking updated successfully"));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingDto>(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisBookingDto>(ex.Message));
        }
    }

    /// <summary>
    /// Delete tennis booking
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBooking(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _bookingService.DeleteBookingAsync(id, userId);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to delete booking"));

            return Ok(ApiResponseHelper.Success<object>(null, "Booking deleted successfully"));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Join tennis booking
    /// </summary>
    [HttpPost("{id}/join")]
    public async Task<ActionResult<ApiResponse<object>>> JoinBooking(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _bookingService.JoinBookingAsync(id, userId);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to join booking"));

            return Ok(ApiResponseHelper.Success<object>(null, "Successfully joined booking"));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Leave tennis booking
    /// </summary>
    [HttpPost("{id}/leave")]
    public async Task<ActionResult<ApiResponse<object>>> LeaveBooking(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _bookingService.LeaveBookingAsync(id, userId);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to leave booking"));

            return Ok(ApiResponseHelper.Success<object>(null, "Successfully left booking"));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Request to join tennis booking
    /// </summary>
    [HttpPost("{id}/request")]
    public async Task<ActionResult<ApiResponse<object>>> RequestToJoin(int id, [FromBody] CreateBookingRequestDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _bookingService.RequestToJoinAsync(id, userId, dto.Message);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to send request"));

            return Ok(ApiResponseHelper.Success<object>(null, "Request sent successfully"));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Respond to booking request
    /// </summary>
    [HttpPost("requests/{requestId}/respond")]
    public async Task<ActionResult<ApiResponse<object>>> RespondToRequest(int requestId, [FromBody] RespondToRequestDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _bookingService.RespondToRequestAsync(requestId, dto.Status, dto.ResponseMessage, userId);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to respond to request"));

            return Ok(ApiResponseHelper.Success<object>(null, "Response sent successfully"));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Get requests for a booking
    /// </summary>
    [HttpGet("{id}/requests")]
    public async Task<ActionResult<ApiResponse<List<BookingRequestDto>>>> GetBookingRequests(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var requests = await _bookingService.GetRequestsByBookingIdAsync(id, userId);
            return Ok(ApiResponseHelper.Success(requests));
        }
        catch (BusinessException ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<BookingRequestDto>>(ex.Message));
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
            var userId = GetCurrentUserId();
            var requests = await _bookingService.GetMyRequestsAsync(userId);
            return Ok(ApiResponseHelper.Success(requests));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<BookingRequestDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get recommended bookings
    /// </summary>
    [HttpGet("recommended")]
    public async Task<ActionResult<ApiResponse<List<TennisBookingDto>>>> GetRecommendedBookings()
    {
        try
        {
            var userId = GetCurrentUserId();
            var bookings = await _bookingService.GetRecommendedBookingsAsync(userId);
            return Ok(ApiResponseHelper.Success(bookings));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisBookingDto>>(ex.Message));
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }
} 