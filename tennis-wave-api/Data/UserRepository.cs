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
}