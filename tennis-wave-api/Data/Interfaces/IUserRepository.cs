using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data.Interfaces;

/// <summary>
/// Defines the contract for user data access operations.
/// </summary>
public interface IUserRepository
{
    Task<bool> ExistsAsync(int userId);
    Task<string> GetUserNameAsync(int userId);
    Task<User> GetUserByIdAsync(int userId);
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task DeleteUserAsync(int userId);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null);
    Task<bool> IsUserNameUniqueAsync(string userName, int? excludeUserId = null);
    Task<List<User>> SearchUsersAsync(string query, int excludeUserId);
    
    // Pagination methods
    Task<(List<User> Users, int TotalCount)> GetUsersWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<(List<User> Users, int TotalCount)> SearchUsersWithPaginationAsync(string? keyword, string? tennisLevel, string? preferredLocation, int? excludeUserId, int page, int pageSize, string? sortBy = null, bool sortDescending = false);
    Task<(List<User> Users, int TotalCount)> GetRecommendedPartnersWithPaginationAsync(int userId, int page, int pageSize);
}