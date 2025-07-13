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
        
        // Update properties
        if (!string.IsNullOrEmpty(updateUserDto.UserName))
            existingUser.UserName = updateUserDto.UserName;
        if (!string.IsNullOrEmpty(updateUserDto.Bio))
            existingUser.Bio = updateUserDto.Bio;
        if (!string.IsNullOrEmpty(updateUserDto.TennisLevel))
            existingUser.TennisLevel = updateUserDto.TennisLevel;
        if (!string.IsNullOrEmpty(updateUserDto.PreferredLocation))
            existingUser.PreferredLocation = updateUserDto.PreferredLocation;
        if (!string.IsNullOrEmpty(updateUserDto.Avatar))
            existingUser.Avatar = updateUserDto.Avatar;
        
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
        
        // Hash the current password for comparison
        using var sha256 = SHA256.Create();
        var currentPasswordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(changePasswordDto.CurrentPassword)));
        
        if (user.PasswordHash != currentPasswordHash)
        {
            throw new BusinessException("Current password is incorrect", "INVALID_PASSWORD");
        }
        
        // Hash the new password
        var newPasswordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(changePasswordDto.NewPassword)));
        user.PasswordHash = newPasswordHash;
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

    public async Task<List<UserDto>> GetRecommendedPartnersAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null) return new List<UserDto>();

        var allUsers = await _userRepository.GetAllUsersAsync();
        var recommended = allUsers
            .Where(u => u.Id != userId)
            .Select(u => new
            {
                User = u,
                LevelMatch = !string.IsNullOrEmpty(user.TennisLevel) && u.TennisLevel == user.TennisLevel,
                LocationMatch = !string.IsNullOrEmpty(user.PreferredLocation) && u.PreferredLocation == user.PreferredLocation
            })
            .OrderByDescending(x => x.LevelMatch)
            .ThenByDescending(x => x.LocationMatch)
            .ThenBy(x => x.User.CreatedAt)
            .Take(10)
            .Select(x => x.User)
            .ToList();

        return _mapper.Map<List<UserDto>>(recommended);
    }

    // Pagination methods
    public async Task<UserSearchResultDto> GetUsersWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var (users, totalCount) = await _userRepository.GetUsersWithPaginationAsync(page, pageSize, sortBy, sortDescending);
        var userDtos = _mapper.Map<List<UserDto>>(users);
        
        var result = new UserSearchResultDto
        {
            Items = userDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            HasNextPage = page < (int)Math.Ceiling((double)totalCount / pageSize),
            HasPreviousPage = page > 1
        };

        // Add statistics
        var allUsers = await _userRepository.GetAllUsersAsync();
        result.LevelCounts = allUsers
            .Where(u => !string.IsNullOrEmpty(u.TennisLevel))
            .GroupBy(u => u.TennisLevel)
            .ToDictionary(g => g.Key, g => g.Count());
        
        result.LocationCounts = allUsers
            .Where(u => !string.IsNullOrEmpty(u.PreferredLocation))
            .GroupBy(u => u.PreferredLocation)
            .ToDictionary(g => g.Key, g => g.Count());
        
        result.AvailableLevels = allUsers
            .Where(u => !string.IsNullOrEmpty(u.TennisLevel))
            .Select(u => u.TennisLevel)
            .Distinct()
            .OrderBy(l => l)
            .ToList();
        
        result.AvailableLocations = allUsers
            .Where(u => !string.IsNullOrEmpty(u.PreferredLocation))
            .Select(u => u.PreferredLocation)
            .Distinct()
            .OrderBy(l => l)
            .ToList();

        return result;
    }

    public async Task<UserSearchResultDto> SearchUsersWithPaginationAsync(UserSearchDto searchDto, int excludeUserId)
    {
        var (users, totalCount) = await _userRepository.SearchUsersWithPaginationAsync(
            searchDto.Keyword,
            searchDto.TennisLevel,
            searchDto.PreferredLocation,
            excludeUserId,
            searchDto.Page,
            searchDto.PageSize,
            searchDto.SortBy,
            searchDto.SortDescending);
        
        var userDtos = _mapper.Map<List<UserDto>>(users);
        
        var result = new UserSearchResultDto
        {
            Items = userDtos,
            TotalCount = totalCount,
            Page = searchDto.Page,
            PageSize = searchDto.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / searchDto.PageSize),
            HasNextPage = searchDto.Page < (int)Math.Ceiling((double)totalCount / searchDto.PageSize),
            HasPreviousPage = searchDto.Page > 1
        };

        // Add statistics
        var allUsers = await _userRepository.GetAllUsersAsync();
        result.LevelCounts = allUsers
            .Where(u => !string.IsNullOrEmpty(u.TennisLevel))
            .GroupBy(u => u.TennisLevel)
            .ToDictionary(g => g.Key, g => g.Count());
        
        result.LocationCounts = allUsers
            .Where(u => !string.IsNullOrEmpty(u.PreferredLocation))
            .GroupBy(u => u.PreferredLocation)
            .ToDictionary(g => g.Key, g => g.Count());
        
        result.AvailableLevels = allUsers
            .Where(u => !string.IsNullOrEmpty(u.TennisLevel))
            .Select(u => u.TennisLevel)
            .Distinct()
            .OrderBy(l => l)
            .ToList();
        
        result.AvailableLocations = allUsers
            .Where(u => !string.IsNullOrEmpty(u.PreferredLocation))
            .Select(u => u.PreferredLocation)
            .Distinct()
            .OrderBy(l => l)
            .ToList();

        return result;
    }

    public async Task<UserSearchResultDto> GetRecommendedPartnersWithPaginationAsync(int userId, int page, int pageSize)
    {
        var (users, totalCount) = await _userRepository.GetRecommendedPartnersWithPaginationAsync(userId, page, pageSize);
        var userDtos = _mapper.Map<List<UserDto>>(users);
        
        var result = new UserSearchResultDto
        {
            Items = userDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            HasNextPage = page < (int)Math.Ceiling((double)totalCount / pageSize),
            HasPreviousPage = page > 1
        };

        // Add statistics
        var allUsers = await _userRepository.GetAllUsersAsync();
        result.LevelCounts = allUsers
            .Where(u => !string.IsNullOrEmpty(u.TennisLevel))
            .GroupBy(u => u.TennisLevel)
            .ToDictionary(g => g.Key, g => g.Count());
        
        result.LocationCounts = allUsers
            .Where(u => !string.IsNullOrEmpty(u.PreferredLocation))
            .GroupBy(u => u.PreferredLocation)
            .ToDictionary(g => g.Key, g => g.Count());
        
        result.AvailableLevels = allUsers
            .Where(u => !string.IsNullOrEmpty(u.TennisLevel))
            .Select(u => u.TennisLevel)
            .Distinct()
            .OrderBy(l => l)
            .ToList();
        
        result.AvailableLocations = allUsers
            .Where(u => !string.IsNullOrEmpty(u.PreferredLocation))
            .Select(u => u.PreferredLocation)
            .Distinct()
            .OrderBy(l => l)
            .ToList();

        return result;
    }
}