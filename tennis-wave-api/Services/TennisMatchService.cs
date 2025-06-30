using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Services.Interfaces;
using AutoMapper;

namespace tennis_wave_api.Services;

public class TennisMatchService : ITennisMatchService
{
    private readonly ITennisMatchRepository _tennisMatchRepository;
    private readonly IMapper _mapper;

    public TennisMatchService(ITennisMatchRepository tennisMatchRepository, IMapper mapper)
    {
        _tennisMatchRepository = tennisMatchRepository;
        _mapper = mapper;
    }

    public async Task<List<TennisMatchDto>> GetAllMatchesAsync()
    {
        var matches = await _tennisMatchRepository.GetAllAsync();
        return _mapper.Map<List<TennisMatchDto>>(matches);
    }

    public async Task<TennisMatchDto?> GetMatchByIdAsync(int matchId)
    {
        var match = await _tennisMatchRepository.GetByIdAsync(matchId);
        return _mapper.Map<TennisMatchDto>(match);
    }

    public async Task<List<TennisMatchDto>> GetMatchesByUserIdAsync(int userId)
    {
        var matches = await _tennisMatchRepository.GetByUserIdAsync(userId);
        return _mapper.Map<List<TennisMatchDto>>(matches);
    }

    public async Task<TennisMatchDto> CreateMatchAsync(CreateTennisMatchDto createDto, int creatorId)
    {
        var match = new TennisMatch
        {
            Title = createDto.Title,
            Description = createDto.Description,
            MatchTime = createDto.MatchTime,
            Location = createDto.Location,
            Latitude = createDto.Latitude,
            Longitude = createDto.Longitude,
            MatchType = createDto.MatchType,
            SkillLevel = createDto.SkillLevel,
            MaxParticipants = createDto.MaxParticipants,
            CreatorId = creatorId,
            CurrentParticipants = 1
        };

        var createdMatch = await _tennisMatchRepository.CreateAsync(match);

        // Add creator as first participant
        var participant = new MatchParticipant
        {
            MatchId = createdMatch.Id,
            UserId = creatorId,
            Role = "Creator"
        };

        await _tennisMatchRepository.AddParticipantAsync(participant);

        return await GetMatchByIdAsync(createdMatch.Id) ?? throw new Exception("Failed to create match");
    }

    public async Task<TennisMatchDto> UpdateMatchAsync(int matchId, UpdateTennisMatchDto updateDto, int userId)
    {
        var match = await _tennisMatchRepository.GetByIdAsync(matchId);
        if (match == null)
            throw new Exception("Match not found");

        if (match.CreatorId != userId)
            throw new Exception("Only the creator can update this match");

        match.Title = updateDto.Title;
        match.Description = updateDto.Description;
        match.MatchTime = updateDto.MatchTime;
        match.Location = updateDto.Location;
        match.Latitude = updateDto.Latitude;
        match.Longitude = updateDto.Longitude;
        match.MatchType = updateDto.MatchType;
        match.SkillLevel = updateDto.SkillLevel;
        match.MaxParticipants = updateDto.MaxParticipants;
        match.Status = updateDto.Status;
        match.UpdatedAt = DateTime.UtcNow;

        var updatedMatch = await _tennisMatchRepository.UpdateAsync(match);
        return _mapper.Map<TennisMatchDto>(updatedMatch);
    }

    public async Task<bool> DeleteMatchAsync(int matchId, int userId)
    {
        if (!await _tennisMatchRepository.IsUserCreatorAsync(matchId, userId))
            return false;

        return await _tennisMatchRepository.DeleteAsync(matchId);
    }

    public async Task<bool> JoinMatchAsync(int matchId, int userId)
    {
        var match = await _tennisMatchRepository.GetByIdAsync(matchId);
        if (match == null || match.Status != "Open")
            return false;

        if (match.CurrentParticipants >= match.MaxParticipants)
            return false;

        if (await _tennisMatchRepository.IsUserParticipantAsync(matchId, userId))
            return false;

        var participant = new MatchParticipant
        {
            MatchId = matchId,
            UserId = userId,
            Role = "Participant"
        };

        await _tennisMatchRepository.AddParticipantAsync(participant);

        // Update match participant count
        match.CurrentParticipants++;
        if (match.CurrentParticipants >= match.MaxParticipants)
            match.Status = "Full";

        await _tennisMatchRepository.UpdateAsync(match);
        return true;
    }

    public async Task<bool> LeaveMatchAsync(int matchId, int userId)
    {
        var participant = await _tennisMatchRepository.GetParticipantAsync(matchId, userId);
        if (participant == null)
            return false;

        if (participant.Role == "Creator")
            return false; // Creator cannot leave, only delete

        var success = await _tennisMatchRepository.RemoveParticipantAsync(matchId, userId);
        if (!success)
            return false;

        // Update match participant count
        var match = await _tennisMatchRepository.GetByIdAsync(matchId);
        if (match != null)
        {
            match.CurrentParticipants--;
            if (match.Status == "Full" && match.CurrentParticipants < match.MaxParticipants)
                match.Status = "Open";

            await _tennisMatchRepository.UpdateAsync(match);
        }

        return true;
    }
}