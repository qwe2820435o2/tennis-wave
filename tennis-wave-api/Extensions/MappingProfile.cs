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

        // Chat mappings
        CreateMap<Conversation, ConversationDto>()
            .ForMember(dest => dest.User1Name, opt => opt.MapFrom(src => src.User1.UserName))
            .ForMember(dest => dest.User2Name, opt => opt.MapFrom(src => src.User2.UserName))
            .ForMember(dest => dest.User1Avatar, opt => opt.MapFrom(src => src.User1.Avatar))
            .ForMember(dest => dest.User2Avatar, opt => opt.MapFrom(src => src.User2.Avatar))
            .ForMember(dest => dest.LastMessage, opt => opt.MapFrom(src => src.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault().Content))
            .ForMember(dest => dest.OtherUserId, opt => opt.Ignore()) // Will be set manually
            .ForMember(dest => dest.OtherUserName, opt => opt.Ignore()) // Will be set manually
            .ForMember(dest => dest.OtherUserAvatar, opt => opt.Ignore()) // Will be set manually
            .ForMember(dest => dest.UnreadCount, opt => opt.Ignore()); // Will be set manually

        CreateMap<Message, MessageDto>()
            .ForMember(dest => dest.SenderName, opt => opt.MapFrom(src => src.Sender.UserName))
            .ForMember(dest => dest.SenderAvatar, opt => opt.MapFrom(src => src.Sender.Avatar))
            .ForMember(dest => dest.IsFromCurrentUser, opt => opt.Ignore()); // Will be set manually

        CreateMap<SendMessageDto, Message>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ConversationId, opt => opt.Ignore())
            .ForMember(dest => dest.SenderId, opt => opt.Ignore())
            .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Conversation, opt => opt.Ignore())
            .ForMember(dest => dest.Sender, opt => opt.Ignore());

        CreateMap<User, UserSearchDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id));

    }
    
}