using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Services.Interfaces;

public interface IUserService
{
    Task<string> GetUserNameAsync(string userId);
    Task<User> GetUserByIdAsync(string userId);
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task DeleteUserAsync(string userId);
}