using System.Collections.Generic;
using System.Threading.Tasks;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto> GetUserByIdAsync(int userId);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto updateUserDto);
    Task DeleteUserAsync(int userId);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
    Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null);
    Task<bool> IsUserNameUniqueAsync(string userName, int? excludeUserId = null);
    Task UpdateUserOnlineStatusAsync(int userId, bool isOnline);
    Task<List<UserSearchDto>> SearchUsersAsync(string query, int excludeUserId);
}