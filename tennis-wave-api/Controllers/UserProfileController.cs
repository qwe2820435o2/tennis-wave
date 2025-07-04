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
public class UserProfileController : ControllerBase
{
    private readonly IUserService _userService;

    public UserProfileController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get current user's profile
    /// </summary>
    /// <returns>User profile information</returns>
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetMyProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            var profile = await _userService.GetUserProfileAsync(userId);
            
            return Ok(ApiResponseHelper.Success(profile));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<UserProfileDto>(ex.Message));
        }
    }

    /// <summary>
    /// Get user profile by ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>User profile information</returns>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetUserProfile(int userId)
    {
        try
        {
            var profile = await _userService.GetUserProfileAsync(userId);
            return Ok(ApiResponseHelper.Success(profile));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<UserProfileDto>(ex.Message));
        }
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    /// <param name="updateDto">Profile update data</param>
    /// <returns>Updated user profile</returns>
    [HttpPut("me")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateMyProfile([FromBody] UpdateUserProfileDto updateDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var updatedProfile = await _userService.UpdateUserProfileAsync(userId, updateDto);
            
            return Ok(ApiResponseHelper.Success(updatedProfile, "Profile updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<UserProfileDto>(ex.Message));
        }
    }

    /// <summary>
    /// Change current user's password
    /// </summary>
    /// <param name="changePasswordDto">Password change data</param>
    /// <returns>Success message</returns>
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _userService.ChangePasswordAsync(userId, changePasswordDto);
            
            return Ok(ApiResponseHelper.Success<object>(null, "Password changed successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    /// <summary>
    /// Check if email is unique
    /// </summary>
    /// <param name="email">Email to check</param>
    /// <returns>True if email is unique</returns>
    [HttpGet("check-email")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<bool>>> CheckEmailUnique([FromQuery] string email)
    {
        try
        {
            var isUnique = await _userService.IsEmailUniqueAsync(email);
            return Ok(ApiResponseHelper.Success(isUnique));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }

    /// <summary>
    /// Check if username is unique
    /// </summary>
    /// <param name="userName">Username to check</param>
    /// <returns>True if username is unique</returns>
    [HttpGet("check-username")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<bool>>> CheckUserNameUnique([FromQuery] string userName)
    {
        try
        {
            var isUnique = await _userService.IsUserNameUniqueAsync(userName);
            return Ok(ApiResponseHelper.Success(isUnique));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<bool>(ex.Message));
        }
    }
    
    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<UserSearchDto>>>> SearchUsers([FromQuery] string query)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var users = await _userService.SearchUsersAsync(query, currentUserId);
            return Ok(ApiResponseHelper.Success(users));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<UserSearchDto>>(ex.Message));
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