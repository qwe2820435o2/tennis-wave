using Microsoft.EntityFrameworkCore;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data;

public class TennisMatchRepository : ITennisMatchRepository
{
    private readonly ApplicationDbContext _context;

    public TennisMatchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TennisMatch>> GetAllAsync()
    {
        return await _context.TennisMatches
            .Include(m => m.Creator)
            .Include(m => m.Participants)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<TennisMatch?> GetByIdAsync(int id)
    {
        return await _context.TennisMatches
            .Include(m => m.Creator)
            .Include(m => m.Participants)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<List<TennisMatch>> GetByUserIdAsync(int userId)
    {
        return await _context.TennisMatches
            .Include(m => m.Creator)
            .Include(m => m.Participants)
            .Where(m => m.CreatorId == userId || m.Participants.Any(p => p.UserId == userId))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<TennisMatch> CreateAsync(TennisMatch match)
    {
        _context.TennisMatches.Add(match);
        await _context.SaveChangesAsync();
        return match;
    }

    public async Task<TennisMatch> UpdateAsync(TennisMatch match)
    {
        _context.TennisMatches.Update(match);
        await _context.SaveChangesAsync();
        return match;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var match = await _context.TennisMatches.FindAsync(id);
        if (match == null)
            return false;

        _context.TennisMatches.Remove(match);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.TennisMatches.AnyAsync(m => m.Id == id);
    }

    public async Task<bool> IsUserParticipantAsync(int matchId, int userId)
    {
        return await _context.MatchParticipants
            .AnyAsync(p => p.MatchId == matchId && p.UserId == userId);
    }

    public async Task<bool> IsUserCreatorAsync(int matchId, int userId)
    {
        return await _context.TennisMatches
            .AnyAsync(m => m.Id == matchId && m.CreatorId == userId);
    }

    public async Task<int> GetParticipantCountAsync(int matchId)
    {
        return await _context.MatchParticipants
            .CountAsync(p => p.MatchId == matchId);
    }

    public async Task<List<MatchParticipant>> GetParticipantsAsync(int matchId)
    {
        return await _context.MatchParticipants
            .Include(p => p.User)
            .Where(p => p.MatchId == matchId)
            .ToListAsync();
    }

    public async Task<MatchParticipant?> GetParticipantAsync(int matchId, int userId)
    {
        return await _context.MatchParticipants
            .FirstOrDefaultAsync(p => p.MatchId == matchId && p.UserId == userId);
    }

    public async Task<MatchParticipant> AddParticipantAsync(MatchParticipant participant)
    {
        _context.MatchParticipants.Add(participant);
        await _context.SaveChangesAsync();
        return participant;
    }

    public async Task<bool> RemoveParticipantAsync(int matchId, int userId)
    {
        var participant = await _context.MatchParticipants
            .FirstOrDefaultAsync(p => p.MatchId == matchId && p.UserId == userId);
        
        if (participant == null)
            return false;

        _context.MatchParticipants.Remove(participant);
        await _context.SaveChangesAsync();
        return true;
    }
}