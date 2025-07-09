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

    /// <summary>
    /// Advanced search for tennis bookings
    /// </summary>
    public async Task<(List<TennisBooking> Bookings, int TotalCount)> SearchBookingsAsync(
        string? keyword = null,
        string? location = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        TimeSpan? startTime = null,
        TimeSpan? endTime = null,
        BookingType? type = null,
        BookingStatus? status = null,
        SkillLevel? minSkillLevel = null,
        SkillLevel? maxSkillLevel = null,
        int? minParticipants = null,
        int? maxParticipants = null,
        bool? hasAvailableSlots = null,
        double? latitude = null,
        double? longitude = null,
        double? radiusKm = null,
        int? creatorId = null,
        bool? isMyBooking = null,
        bool? isParticipating = null,
        bool? isFlexible = null,
        string? sortBy = null,
        bool? sortDescending = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
                .ThenInclude(p => p.User)
            .Include(b => b.Requests)
                .ThenInclude(r => r.Requester)
            .AsQueryable();

        // Keyword search
        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(b => 
                b.Title.Contains(keyword) || 
                b.Description.Contains(keyword) ||
                b.Location.Contains(keyword));
        }

        // Location search
        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(b => b.Location.Contains(location));
        }

        // Date range filter
        if (startDate.HasValue)
        {
            query = query.Where(b => b.BookingTime.Date >= startDate.Value.Date);
        }
        if (endDate.HasValue)
        {
            query = query.Where(b => b.BookingTime.Date <= endDate.Value.Date);
        }

        // Time range filter
        if (startTime.HasValue)
        {
            query = query.Where(b => b.BookingTime.TimeOfDay >= startTime.Value);
        }
        if (endTime.HasValue)
        {
            query = query.Where(b => b.BookingTime.TimeOfDay <= endTime.Value);
        }

        // Type filter
        if (type.HasValue)
        {
            query = query.Where(b => b.Type == type.Value);
        }

        // Status filter
        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        // Skill level filters
        if (minSkillLevel.HasValue)
        {
            query = query.Where(b => b.MinSkillLevel >= minSkillLevel.Value);
        }
        if (maxSkillLevel.HasValue)
        {
            query = query.Where(b => b.MaxSkillLevel <= maxSkillLevel.Value);
        }

        // Participant filters
        if (minParticipants.HasValue)
        {
            query = query.Where(b => b.CurrentParticipants >= minParticipants.Value);
        }
        if (maxParticipants.HasValue)
        {
            query = query.Where(b => b.MaxParticipants <= maxParticipants.Value);
        }
        if (hasAvailableSlots.HasValue && hasAvailableSlots.Value)
        {
            query = query.Where(b => b.CurrentParticipants < b.MaxParticipants);
        }

        // Location radius filter (if coordinates provided)
        if (latitude.HasValue && longitude.HasValue && radiusKm.HasValue)
        {
            // Simple distance calculation (can be optimized with spatial indexes)
            query = query.Where(b => 
                b.Latitude.HasValue && b.Longitude.HasValue &&
                CalculateDistance(latitude.Value, longitude.Value, b.Latitude.Value, b.Longitude.Value) <= radiusKm.Value);
        }

        // Creator filter
        if (creatorId.HasValue)
        {
            query = query.Where(b => b.CreatorId == creatorId.Value);
        }

        // My bookings filter
        if (isMyBooking.HasValue && isMyBooking.Value && creatorId.HasValue)
        {
            query = query.Where(b => b.CreatorId == creatorId.Value);
        }

        // Participating filter
        if (isParticipating.HasValue && isParticipating.Value && creatorId.HasValue)
        {
            query = query.Where(b => b.Participants.Any(p => p.UserId == creatorId.Value));
        }

        // Flexibility filter
        if (isFlexible.HasValue)
        {
            query = query.Where(b => b.IsFlexible == isFlexible.Value);
        }

        // Sorting
        query = sortBy?.ToLower() switch
        {
            "time" => sortDescending == true 
                ? query.OrderByDescending(b => b.BookingTime)
                : query.OrderBy(b => b.BookingTime),
            "distance" when latitude.HasValue && longitude.HasValue => 
                query.OrderBy(b => CalculateDistance(latitude.Value, longitude.Value, b.Latitude ?? 0, b.Longitude ?? 0)),
            "skill" => sortDescending == true
                ? query.OrderByDescending(b => b.MinSkillLevel)
                : query.OrderBy(b => b.MinSkillLevel),
            "participants" => sortDescending == true
                ? query.OrderByDescending(b => b.CurrentParticipants)
                : query.OrderBy(b => b.CurrentParticipants),
            _ => query.OrderByDescending(b => b.CreatedAt)
        };

        // Get total count
        var totalCount = await query.CountAsync();

        // Pagination
        var skip = (page - 1) * pageSize;
        var bookings = await query
            .ToListAsync();

        return (bookings, totalCount);
    }

    /// <summary>
    /// Get booking statistics for search filters
    /// </summary>
    public async Task<Dictionary<string, object>> GetBookingStatisticsAsync()
    {
        var stats = new Dictionary<string, object>();

        // Type counts
        var typeCounts = await _context.TennisBookings
            .GroupBy(b => b.Type)
            .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count);
        stats["TypeCounts"] = typeCounts;

        // Status counts
        var statusCounts = await _context.TennisBookings
            .GroupBy(b => b.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);
        stats["StatusCounts"] = statusCounts;

        // Skill level counts
        var skillCounts = await _context.TennisBookings
            .GroupBy(b => b.MinSkillLevel)
            .Select(g => new { SkillLevel = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.SkillLevel, x => x.Count);
        stats["SkillLevelCounts"] = skillCounts;

        // Available locations
        var locations = await _context.TennisBookings
            .Where(b => !string.IsNullOrEmpty(b.Location))
            .Select(b => b.Location)
            .Distinct()
            .Take(50)
            .ToListAsync();
        stats["AvailableLocations"] = locations;

        return stats;
    }

    /// <summary>
    /// Calculate distance between two coordinates using Haversine formula
    /// </summary>
    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadius = 6371; // Earth's radius in kilometers

        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return earthRadius * c;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
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