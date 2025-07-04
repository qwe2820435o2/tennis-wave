using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto> GetUserByIdAsync(int userId)
    {
        try
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            return _mapper.Map<UserDto>(user);
        }
        catch (KeyNotFoundException)
        {
            throw new BusinessException($"User {userId} is not exist", "USER_NOT_FOUND");
        }
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        var user = _mapper.Map<User>(createUserDto);
        var createdUser = await _userRepository.CreateUserAsync(user);
        return _mapper.Map<UserDto>(createdUser);
    }

    public async Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto updateUserDto)
    {
        var existingUser = await _userRepository.GetUserByIdAsync(userId);
    
        // Check if username is being changed and if it's unique
        if (!string.IsNullOrEmpty(updateUserDto.UserName) && 
            updateUserDto.UserName != existingUser.UserName &&
            !await IsUserNameUniqueAsync(updateUserDto.UserName, userId))
        {
            throw new BusinessException("Username already exists", "USERNAME_ALREADY_EXISTS");
        }

        // Use AutoMapper to mapper
        _mapper.Map(updateUserDto, existingUser);

        existingUser.UpdatedAt = DateTime.UtcNow;
    
        var updatedUser = await _userRepository.UpdateUserAsync(existingUser);
        return _mapper.Map<UserDto>(updatedUser);
    }

    public async Task DeleteUserAsync(int userId)
    {
        await _userRepository.DeleteUserAsync(userId);
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
    
        // Verify current password using BCrypt
        if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
        {
            throw new BusinessException("Current password is incorrect", "INVALID_CURRENT_PASSWORD");
        }

        // Hash new password using BCrypt
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
    
        await _userRepository.UpdateUserAsync(user);
        return true;
    }

    public async Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null)
    {
        return await _userRepository.IsEmailUniqueAsync(email, excludeUserId);
    }

    public async Task<bool> IsUserNameUniqueAsync(string userName, int? excludeUserId = null)
    {
        return await _userRepository.IsUserNameUniqueAsync(userName, excludeUserId);
    }

    public async Task UpdateUserOnlineStatusAsync(int userId, bool isOnline)
    {
        // For now, we'll just log the status change
        // In a real application, you might want to store this in the database
        // and update the User entity to include an IsOnline field
        Console.WriteLine($"User {userId} is now {(isOnline ? "online" : "offline")}");
        await Task.CompletedTask;
    }

    public async Task<List<UserSearchDto>> SearchUsersAsync(string query, int excludeUserId)
    {
        var users = await _userRepository.SearchUsersAsync(query, excludeUserId);
        return _mapper.Map<List<UserSearchDto>>(users);
    }
}