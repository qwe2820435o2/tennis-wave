using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data.Interfaces;

public interface ITennisMatchRepository
{
    Task<List<TennisMatch>> GetAllAsync();
    Task<TennisMatch?> GetByIdAsync(int id);
    Task<List<TennisMatch>> GetByUserIdAsync(int userId);
    Task<TennisMatch> CreateAsync(TennisMatch match);
    Task<TennisMatch> UpdateAsync(TennisMatch match);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> IsUserParticipantAsync(int matchId, int userId);
    Task<bool> IsUserCreatorAsync(int matchId, int userId);
    Task<int> GetParticipantCountAsync(int matchId);
    Task<List<MatchParticipant>> GetParticipantsAsync(int matchId);
    Task<MatchParticipant?> GetParticipantAsync(int matchId, int userId);
    Task<MatchParticipant> AddParticipantAsync(MatchParticipant participant);
    Task<bool> RemoveParticipantAsync(int matchId, int userId);
}