using Microsoft.AspNetCore.Mvc;
using tennis_wave_api.Helpers;
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
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(ApiResponseHelper.Success(users));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(string id)
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
    public async Task<ActionResult<UserDto>> UpdateUser(string id, UpdateUserDto updateUserDto)
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
    public async Task<ActionResult> DeleteUser(string id)
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
}