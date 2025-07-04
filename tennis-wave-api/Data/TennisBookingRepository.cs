using Microsoft.EntityFrameworkCore;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Data;

/// <summary>
/// Tennis booking repository implementation
/// </summary>
public class TennisBookingRepository : ITennisBookingRepository
{
    private readonly ApplicationDbContext _context;

    public TennisBookingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TennisBooking>> GetAllAsync()
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
                .ThenInclude(p => p.User)
            .Include(b => b.Requests)
                .ThenInclude(r => r.Requester)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<TennisBooking?> GetByIdAsync(int id)
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
                .ThenInclude(p => p.User)
            .Include(b => b.Requests)
                .ThenInclude(r => r.Requester)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<List<TennisBooking>> GetByCreatorIdAsync(int creatorId)
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
            .Where(b => b.CreatorId == creatorId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<TennisBooking>> GetByParticipantIdAsync(int participantId)
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
            .Where(b => b.Participants.Any(p => p.UserId == participantId))
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<TennisBooking>> GetByStatusAsync(BookingStatus status)
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
            .Where(b => b.Status == status)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<TennisBooking>> GetByTypeAsync(BookingType type)
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
            .Where(b => b.Type == type)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<TennisBooking>> GetByLocationAsync(string location)
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
            .Where(b => b.Location.Contains(location))
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<TennisBooking>> GetBySkillLevelAsync(SkillLevel minLevel, SkillLevel maxLevel)
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
            .Where(b => b.MinSkillLevel >= minLevel && b.MaxSkillLevel <= maxLevel)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<TennisBooking>> GetAvailableBookingsAsync()
    {
        return await _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
            .Where(b => b.Status == BookingStatus.Pending && 
                       b.CurrentParticipants < b.MaxParticipants &&
                       b.BookingTime > DateTime.UtcNow)
            .OrderBy(b => b.BookingTime)
            .ToListAsync();
    }

    public async Task<TennisBooking> CreateAsync(TennisBooking booking)
    {
        _context.TennisBookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<TennisBooking> UpdateAsync(TennisBooking booking)
    {
        _context.TennisBookings.Update(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var booking = await _context.TennisBookings.FindAsync(id);
        if (booking == null) return false;
        
        _context.TennisBookings.Remove(booking);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.TennisBookings.AnyAsync(b => b.Id == id);
    }

    // Participant methods
    public async Task<BookingParticipant?> GetParticipantAsync(int bookingId, int userId)
    {
        return await _context.BookingParticipants
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.BookingId == bookingId && p.UserId == userId);
    }

    public async Task<BookingParticipant> AddParticipantAsync(BookingParticipant participant)
    {
        _context.BookingParticipants.Add(participant);
        await _context.SaveChangesAsync();
        return participant;
    }

    public async Task<BookingParticipant> UpdateParticipantAsync(BookingParticipant participant)
    {
        _context.BookingParticipants.Update(participant);
        await _context.SaveChangesAsync();
        return participant;
    }

    public async Task<bool> RemoveParticipantAsync(int bookingId, int userId)
    {
        var participant = await _context.BookingParticipants
            .FirstOrDefaultAsync(p => p.BookingId == bookingId && p.UserId == userId);
        
        if (participant == null) return false;
        
        _context.BookingParticipants.Remove(participant);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<BookingParticipant>> GetParticipantsByBookingIdAsync(int bookingId)
    {
        return await _context.BookingParticipants
            .Include(p => p.User)
            .Where(p => p.BookingId == bookingId)
            .ToListAsync();
    }

    // Request methods
    public async Task<BookingRequest?> GetRequestAsync(int requestId)
    {
        return await _context.BookingRequests
            .Include(r => r.Requester)
            .Include(r => r.Booking)
            .FirstOrDefaultAsync(r => r.Id == requestId);
    }

    public async Task<BookingRequest> CreateRequestAsync(BookingRequest request)
    {
        _context.BookingRequests.Add(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<BookingRequest> UpdateRequestAsync(BookingRequest request)
    {
        _context.BookingRequests.Update(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<List<BookingRequest>> GetRequestsByBookingIdAsync(int bookingId)
    {
        return await _context.BookingRequests
            .Include(r => r.Requester)
            .Where(r => r.BookingId == bookingId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync();
    }

    public async Task<List<BookingRequest>> GetRequestsByRequesterIdAsync(int requesterId)
    {
        return await _context.BookingRequests
            .Include(r => r.Booking)
            .Where(r => r.RequesterId == requesterId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync();
    }
} 