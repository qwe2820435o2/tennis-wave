using Microsoft.EntityFrameworkCore;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(int userId)
    {
        return await _context.Users.AnyAsync(u => u.Id == userId);
    }

    public async Task<string> GetUserNameAsync(int userId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
        
        return user?.UserName ?? throw new KeyNotFoundException($"User with ID {userId} not found");
    }

    public async Task<User> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
        
        return user ?? throw new KeyNotFoundException($"User with ID {userId} not found");
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task DeleteUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        // Finds the first user matching the given email address.
        return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null)
    {
        var query = _context.Users.Where(u => u.Email.ToLower() == email.ToLower());
    
        if (excludeUserId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUserId.Value);
        }
    
        return !await query.AnyAsync();
    }

    public async Task<bool> IsUserNameUniqueAsync(string userName, int? excludeUserId = null)
    {
        var query = _context.Users.Where(u => u.UserName.ToLower() == userName.ToLower());
    
        if (excludeUserId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUserId.Value);
        }
    
        return !await query.AnyAsync();
    }

    public async Task<List<User>> SearchUsersAsync(string query, int excludeUserId)
    {
        return await _context.Users
            .Where(u => u.Id != excludeUserId &&
                        u.UserName.Contains(query))
            .OrderBy(u => u.UserName)
            .Take(20)
            .ToListAsync();
    }

    // Pagination methods
    public async Task<(List<User> Users, int TotalCount)> GetUsersWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var query = _context.Users.AsQueryable();

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    public async Task<(List<User> Users, int TotalCount)> SearchUsersWithPaginationAsync(string? keyword, string? tennisLevel, string? preferredLocation, int? excludeUserId, int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var query = _context.Users.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(u => u.UserName.Contains(keyword) || 
                                   (u.Bio != null && u.Bio.Contains(keyword)));
        }

        if (!string.IsNullOrEmpty(tennisLevel))
        {
            query = query.Where(u => u.TennisLevel == tennisLevel);
        }

        if (!string.IsNullOrEmpty(preferredLocation))
        {
            query = query.Where(u => u.PreferredLocation == preferredLocation);
        }

        if (excludeUserId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUserId.Value);
        }

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    public async Task<(List<User> Users, int TotalCount)> GetRecommendedPartnersWithPaginationAsync(int userId, int page, int pageSize)
    {
        var currentUser = await _context.Users.FindAsync(userId);
        if (currentUser == null)
        {
            return (new List<User>(), 0);
        }

        var query = _context.Users
            .Where(u => u.Id != userId)
            .AsQueryable();

        // Apply recommendation logic
        var recommendedQuery = query.Select(u => new
        {
            User = u,
            LevelMatch = !string.IsNullOrEmpty(currentUser.TennisLevel) && u.TennisLevel == currentUser.TennisLevel,
            LocationMatch = !string.IsNullOrEmpty(currentUser.PreferredLocation) && u.PreferredLocation == currentUser.PreferredLocation
        })
        .OrderByDescending(x => x.LevelMatch)
        .ThenByDescending(x => x.LocationMatch)
        .ThenBy(x => x.User.CreatedAt)
        .Select(x => x.User);

        var totalCount = await recommendedQuery.CountAsync();
        var users = await recommendedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    private IQueryable<User> ApplySorting(IQueryable<User> query, string? sortBy, bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "username" => sortDescending ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName),
            "email" => sortDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "tennislevel" => sortDescending ? query.OrderByDescending(u => u.TennisLevel) : query.OrderBy(u => u.TennisLevel),
            "preferredlocation" => sortDescending ? query.OrderByDescending(u => u.PreferredLocation) : query.OrderBy(u => u.PreferredLocation),
            "createdat" => sortDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            "updatedat" => sortDescending ? query.OrderByDescending(u => u.UpdatedAt) : query.OrderBy(u => u.UpdatedAt),
            _ => sortDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt)
        };
    }
}