using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tennis_wave_api.Helpers;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Services.Interfaces;
using System.Security.Claims;
using tennis_wave_api.Models;

namespace tennis_wave_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TennisMatchController : ControllerBase
{
    private readonly ITennisMatchService _tennisMatchService;

    public TennisMatchController(ITennisMatchService tennisMatchService)
    {
        _tennisMatchService = tennisMatchService;
    }

    /// <summary>
    /// Get all tennis matches
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TennisMatchDto>>>> GetAllMatches()
    {
        try
        {
            var matches = await _tennisMatchService.GetAllMatchesAsync();
            return Ok(ApiResponseHelper.Success(matches));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisMatchDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Get tennis match by ID
    /// </summary>
    [HttpGet("{matchId}")]
    public async Task<ActionResult<ApiResponse<TennisMatchDto>>> GetMatchById(int matchId)
    {
        try
        {
            var match = await _tennisMatchService.GetMatchByIdAsync(matchId);
            if (match == null)
                return NotFound(ApiResponseHelper.Fail<TennisMatchDto>("Match not found"));

            return Ok(ApiResponseHelper.Success(match));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisMatchDto>(ex.Message));
        }
    }

    /// <summary>
    /// Get matches by current user
    /// </summary>
    [HttpGet("my-matches")]
    public async Task<ActionResult<ApiResponse<List<TennisMatchDto>>>> GetMyMatches()
    {
        try
        {
            var userId = GetCurrentUserId();
            var matches = await _tennisMatchService.GetMatchesByUserIdAsync(userId);
            return Ok(ApiResponseHelper.Success(matches));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<TennisMatchDto>>(ex.Message));
        }
    }

    /// <summary>
    /// Create a new tennis match
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TennisMatchDto>>> CreateMatch([FromBody] CreateTennisMatchDto createDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var match = await _tennisMatchService.CreateMatchAsync(createDto, userId);
            return Ok(ApiResponseHelper.Success(match, "Match created successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisMatchDto>(ex.Message));
        }
    }

    /// <summary>
    /// Update tennis match
    /// </summary>
    [HttpPut("{matchId}")]
    public async Task<ActionResult<ApiResponse<TennisMatchDto>>> UpdateMatch(int matchId, [FromBody] UpdateTennisMatchDto updateDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var match = await _tennisMatchService.UpdateMatchAsync(matchId, updateDto, userId);
            return Ok(ApiResponseHelper.Success(match, "Match updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<TennisMatchDto>(ex.Message));
        }
    }

    /// <summary>
    /// Delete tennis match
    /// </summary>
    [HttpDelete("{matchId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteMatch(int matchId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _tennisMatchService.DeleteMatchAsync(matchId, userId);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to delete match"));

            return Ok(ApiResponseHelper.Success<object>(null, "Match deleted successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Join tennis match
    /// </summary>
    [HttpPost("{matchId}/join")]
    public async Task<ActionResult<ApiResponse<object>>> JoinMatch(int matchId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _tennisMatchService.JoinMatchAsync(matchId, userId);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to join match"));

            return Ok(ApiResponseHelper.Success<object>(null, "Successfully joined match"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Leave tennis match
    /// </summary>
    [HttpPost("{matchId}/leave")]
    public async Task<ActionResult<ApiResponse<object>>> LeaveMatch(int matchId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _tennisMatchService.LeaveMatchAsync(matchId, userId);
            if (!success)
                return BadRequest(ApiResponseHelper.Fail<object>("Failed to leave match"));

            return Ok(ApiResponseHelper.Success<object>(null, "Successfully left match"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
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