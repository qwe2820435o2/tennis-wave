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
using AutoMapper;

namespace tennis_wave_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IMapper _mapper;

    public UserController(IUserService userService, IMapper mapper)
    {
        _userService = userService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(ApiResponseHelper.Success(users));
    }

    /// <summary>
    /// Get users with pagination
    /// </summary>
    [HttpGet("paginated")]
    [AllowAnonymous] 
    public async Task<ActionResult<ApiResponse<UserSearchResultDto>>> GetUsersWithPagination(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        try
        {
            var result = await _userService.GetUsersWithPaginationAsync(page, pageSize, sortBy, sortDescending);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<UserSearchResultDto>(ex.Message));
        }
    }

    /// <summary>
    /// Search users with pagination
    /// </summary>
    [HttpPost("search")]
    public async Task<ActionResult<ApiResponse<UserSearchResultDto>>> SearchUsersWithPagination([FromBody] UserSearchDto searchDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.SearchUsersWithPaginationAsync(searchDto, userId);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<UserSearchResultDto>(ex.Message));
        }
    }

    /// <summary>
    /// Get recommended partners with pagination
    /// </summary>
    [HttpGet("recommended-partners")]
    public async Task<ActionResult<ApiResponse<UserSearchResultDto>>> GetRecommendedPartnersWithPagination(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.GetRecommendedPartnersWithPaginationAsync(userId, page, pageSize);
            return Ok(ApiResponseHelper.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<UserSearchResultDto>(ex.Message));
        }
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
            return NotFound(ApiResponseHelper.Fail<UserDto>("User not found"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<UserDto>(ex.Message));
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
            return NotFound(ApiResponseHelper.Fail<object>("User not found"));
        }
    }

    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(int id, ChangePasswordDto changePasswordDto)
    {
        try
        {
            var success = await _userService.ChangePasswordAsync(id, changePasswordDto);
            if (success)
            {
                return Ok(ApiResponseHelper.Success<object>(null, "Password changed successfully"));
            }
            return BadRequest(ApiResponseHelper.Fail<object>("Failed to change password"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
        }
    }

    [HttpGet("check-email")]
    public async Task<ActionResult<bool>> CheckEmailUnique([FromQuery] string email, [FromQuery] int? excludeUserId = null)
    {
        var isUnique = await _userService.IsEmailUniqueAsync(email, excludeUserId);
        return Ok(ApiResponseHelper.Success(isUnique));
    }

    [HttpGet("check-username")]
    public async Task<ActionResult<bool>> CheckUsernameUnique([FromQuery] string userName, [FromQuery] int? excludeUserId = null)
    {
        var isUnique = await _userService.IsUserNameUniqueAsync(userName, excludeUserId);
        return Ok(ApiResponseHelper.Success(isUnique));
    }

    [HttpGet("search-simple")]
    public async Task<ActionResult<ApiResponse<List<UserSearchDto>>>> SearchUsers([FromQuery] string query)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userSearchDtos = await _userService.SearchUsersAsync(query, userId);
            return Ok(ApiResponseHelper.Success(userSearchDtos));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponseHelper.Fail<List<UserSearchDto>>(ex.Message));
        }
    }


}