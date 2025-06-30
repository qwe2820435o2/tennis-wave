using tennis_wave_api.Models.DTOs;

namespace tennis_wave_api.Services.Interfaces;

public interface ITennisMatchService
{
    Task<List<TennisMatchDto>> GetAllMatchesAsync();
    Task<TennisMatchDto?> GetMatchByIdAsync(int matchId);
    Task<List<TennisMatchDto>> GetMatchesByUserIdAsync(int userId);
    Task<TennisMatchDto> CreateMatchAsync(CreateTennisMatchDto createDto, int creatorId);
    Task<TennisMatchDto> UpdateMatchAsync(int matchId, UpdateTennisMatchDto updateDto, int userId);
    Task<bool> DeleteMatchAsync(int matchId, int userId);
    Task<bool> JoinMatchAsync(int matchId, int userId);
    Task<bool> LeaveMatchAsync(int matchId, int userId);
}