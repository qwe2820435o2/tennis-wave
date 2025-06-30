using System;
using AutoMapper;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Extensions;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        
        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)); // ignore null

        CreateMap<User, AuthResponseDto>()
            .ForMember(
                dest => dest.UserId, // The destination property (in AuthResponseDto)
                opt => opt.MapFrom(src => src.Id) // The source property (in User)
            );
        
        CreateMap<User, UserProfileDto>();
        CreateMap<UpdateUserProfileDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)); // ignore null

        // TennisMatch mappings
        CreateMap<TennisMatch, TennisMatchDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.CreatorId, opt => opt.MapFrom(src => src.CreatorId))
            .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator.UserName))
            .ForMember(dest => dest.CreatorAvatar, opt => opt.MapFrom(src => src.Creator.Avatar ?? string.Empty))
            .ForMember(dest => dest.CurrentParticipants, opt => opt.MapFrom(src => src.Participants.Count));

        CreateMap<CreateTennisMatchDto, TennisMatch>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentParticipants, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Active"))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Creator, opt => opt.Ignore())
            .ForMember(dest => dest.Participants, opt => opt.Ignore());

        CreateMap<UpdateTennisMatchDto, TennisMatch>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentParticipants, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Creator, opt => opt.Ignore())
            .ForMember(dest => dest.Participants, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)); // ignore null
    }
}