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

        // Apply filters
        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(b => b.Title.Contains(keyword) || b.Description.Contains(keyword));
        }

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(b => b.Location.Contains(location));
        }

        if (startDate.HasValue)
        {
            query = query.Where(b => b.BookingTime.Date >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(b => b.BookingTime.Date <= endDate.Value.Date);
        }

        if (startTime.HasValue)
        {
            query = query.Where(b => b.BookingTime.TimeOfDay >= startTime.Value);
        }

        if (endTime.HasValue)
        {
            query = query.Where(b => b.BookingTime.TimeOfDay <= endTime.Value);
        }

        if (type.HasValue)
        {
            query = query.Where(b => b.Type == type.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        if (minSkillLevel.HasValue)
        {
            query = query.Where(b => b.MinSkillLevel >= minSkillLevel.Value);
        }

        if (maxSkillLevel.HasValue)
        {
            query = query.Where(b => b.MaxSkillLevel <= maxSkillLevel.Value);
        }

        if (minParticipants.HasValue)
        {
            query = query.Where(b => b.CurrentParticipants >= minParticipants.Value);
        }

        if (maxParticipants.HasValue)
        {
            query = query.Where(b => b.MaxParticipants <= maxParticipants.Value);
        }

        if (hasAvailableSlots == true)
        {
            query = query.Where(b => b.CurrentParticipants < b.MaxParticipants);
        }

        if (latitude.HasValue && longitude.HasValue && radiusKm.HasValue)
        {
            // Simple distance calculation (for production, consider using a spatial database)
            query = query.Where(b => b.Latitude.HasValue && b.Longitude.HasValue &&
                                   CalculateDistance(latitude.Value, longitude.Value, b.Latitude.Value, b.Longitude.Value) <= radiusKm.Value);
        }

        if (creatorId.HasValue)
        {
            query = query.Where(b => b.CreatorId == creatorId.Value);
        }

        if (isMyBooking == true && creatorId.HasValue)
        {
            query = query.Where(b => b.CreatorId == creatorId.Value);
        }

        if (isParticipating == true && creatorId.HasValue)
        {
            query = query.Where(b => b.Participants.Any(p => p.UserId == creatorId.Value));
        }

        if (isFlexible.HasValue)
        {
            query = query.Where(b => b.IsFlexible == isFlexible.Value);
        }

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending ?? false);

        var totalCount = await query.CountAsync();
        var bookings = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (bookings, totalCount);
    }

    public async Task<Dictionary<string, object>> GetBookingStatisticsAsync()
    {
        var totalBookings = await _context.TennisBookings.CountAsync();
        var pendingBookings = await _context.TennisBookings.CountAsync(b => b.Status == BookingStatus.Pending);
        var confirmedBookings = await _context.TennisBookings.CountAsync(b => b.Status == BookingStatus.Confirmed);
        var completedBookings = await _context.TennisBookings.CountAsync(b => b.Status == BookingStatus.Completed);
        var cancelledBookings = await _context.TennisBookings.CountAsync(b => b.Status == BookingStatus.Cancelled);

        var typeStats = await _context.TennisBookings
            .GroupBy(b => b.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Type.ToString(), x => x.Count);

        var locationStats = await _context.TennisBookings
            .GroupBy(b => b.Location)
            .Select(g => new { Location = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Location, x => x.Count);

        return new Dictionary<string, object>
        {
            ["totalBookings"] = totalBookings,
            ["pendingBookings"] = pendingBookings,
            ["confirmedBookings"] = confirmedBookings,
            ["completedBookings"] = completedBookings,
            ["cancelledBookings"] = cancelledBookings,
            ["typeStats"] = typeStats,
            ["locationStats"] = locationStats
        };
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
        if (booking != null)
        {
            _context.TennisBookings.Remove(booking);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    // Participant management
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
        
        if (participant != null)
        {
            _context.BookingParticipants.Remove(participant);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<List<BookingParticipant>> GetParticipantsByBookingIdAsync(int bookingId)
    {
        return await _context.BookingParticipants
            .Include(p => p.User)
            .Where(p => p.BookingId == bookingId)
            .OrderBy(p => p.JoinedAt)
            .ToListAsync();
    }

    public async Task<List<BookingParticipant>> GetParticipantsByUserIdAsync(int userId)
    {
        return await _context.BookingParticipants
            .Include(p => p.Booking)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.JoinedAt)
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

    // Pagination methods
    public async Task<(List<TennisBooking> Bookings, int TotalCount)> GetBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var query = _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
                .ThenInclude(p => p.User)
            .Include(b => b.Requests)
                .ThenInclude(r => r.Requester)
            .AsQueryable();

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        var totalCount = await query.CountAsync();
        var bookings = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (bookings, totalCount);
    }

    public async Task<(List<TennisBooking> Bookings, int TotalCount)> GetAvailableBookingsWithPaginationAsync(int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var query = _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
                .ThenInclude(p => p.User)
            .Include(b => b.Requests)
                .ThenInclude(r => r.Requester)
            .Where(b => b.Status == BookingStatus.Pending && 
                       b.CurrentParticipants < b.MaxParticipants &&
                       b.BookingTime > DateTime.UtcNow)
            .AsQueryable();

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        var totalCount = await query.CountAsync();
        var bookings = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (bookings, totalCount);
    }

    public async Task<(List<TennisBooking> Bookings, int TotalCount)> GetBookingsByCreatorWithPaginationAsync(int creatorId, int page, int pageSize, string? sortBy = null, bool sortDescending = false)
    {
        var query = _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
                .ThenInclude(p => p.User)
            .Include(b => b.Requests)
                .ThenInclude(r => r.Requester)
            .Where(b => b.CreatorId == creatorId)
            .AsQueryable();

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        var totalCount = await query.CountAsync();
        var bookings = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (bookings, totalCount);
    }

    public async Task<(List<TennisBooking> Bookings, int TotalCount)> GetRecommendedBookingsWithPaginationAsync(int userId, int page, int pageSize)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return (new List<TennisBooking>(), 0);
        }

        var query = _context.TennisBookings
            .Include(b => b.Creator)
            .Include(b => b.Participants)
                .ThenInclude(p => p.User)
            .Include(b => b.Requests)
                .ThenInclude(r => r.Requester)
            .Where(b => b.Status == BookingStatus.Pending && 
                       b.CurrentParticipants < b.MaxParticipants &&
                       b.BookingTime > DateTime.UtcNow &&
                       b.CreatorId != userId)
            .AsQueryable();

        // Apply recommendation logic
        var recommendedQuery = query.Select(b => new
        {
            Booking = b,
            LevelMatch = !string.IsNullOrEmpty(user.TennisLevel) && 
                        (b.MinSkillLevel.ToString() == user.TennisLevel || b.MaxSkillLevel.ToString() == user.TennisLevel),
            LocationMatch = !string.IsNullOrEmpty(user.PreferredLocation) && b.Location.Contains(user.PreferredLocation)
        })
        .OrderByDescending(x => x.LevelMatch)
        .ThenByDescending(x => x.LocationMatch)
        .ThenBy(x => x.Booking.BookingTime)
        .Select(x => x.Booking);

        var totalCount = await recommendedQuery.CountAsync();
        var bookings = await recommendedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (bookings, totalCount);
    }

    private IQueryable<TennisBooking> ApplySorting(IQueryable<TennisBooking> query, string? sortBy, bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "title" => sortDescending ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title),
            "bookingtime" => sortDescending ? query.OrderByDescending(b => b.BookingTime) : query.OrderBy(b => b.BookingTime),
            "location" => sortDescending ? query.OrderByDescending(b => b.Location) : query.OrderBy(b => b.Location),
            "type" => sortDescending ? query.OrderByDescending(b => b.Type) : query.OrderBy(b => b.Type),
            "status" => sortDescending ? query.OrderByDescending(b => b.Status) : query.OrderBy(b => b.Status),
            "currentparticipants" => sortDescending ? query.OrderByDescending(b => b.CurrentParticipants) : query.OrderBy(b => b.CurrentParticipants),
            "maxparticipants" => sortDescending ? query.OrderByDescending(b => b.MaxParticipants) : query.OrderBy(b => b.MaxParticipants),
            "createdat" => sortDescending ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt),
            "updatedat" => sortDescending ? query.OrderByDescending(b => b.UpdatedAt) : query.OrderBy(b => b.UpdatedAt),
            _ => sortDescending ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt)
        };
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Earth's radius in kilometers
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
} 