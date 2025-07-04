using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tennis_wave_api.Helpers;
using tennis_wave_api.Models;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize] 
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(ApiResponseHelper.Success(users));
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>User profile information</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(ApiResponseHelper.Success(user));
        }
        catch (KeyNotFoundException)
        {
            return Ok(ApiResponseHelper.Fail<UserDto>("User not found", 404));
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto createUserDto)
    {
        var createdUser = await _userService.CreateUserAsync(createUserDto);
        return Ok(ApiResponseHelper.Success(createdUser, "User created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, UpdateUserDto updateUserDto)
    {
        try
        {
            var updatedUser = await _userService.UpdateUserAsync(id, updateUserDto);
            return Ok(ApiResponseHelper.Success(updatedUser, "User updated successfully"));
        }
        catch (KeyNotFoundException)
        {
            return Ok(ApiResponseHelper.Fail<UserDto>("User not found", 404));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        try
        {
            await _userService.DeleteUserAsync(id);
            return Ok(ApiResponseHelper.Success<object>(null, "User deleted successfully"));
        }
        catch (KeyNotFoundException)
        {
            return Ok(ApiResponseHelper.Fail<object>("User not found", 404));
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