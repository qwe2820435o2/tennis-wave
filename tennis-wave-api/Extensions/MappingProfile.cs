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
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.Bio));
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.Bio));
        
        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.Bio))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)); // ignore null

        CreateMap<User, AuthResponseDto>()
            .ForMember(
                dest => dest.UserId, // The destination property (in AuthResponseDto)
                opt => opt.MapFrom(src => src.Id) // The source property (in User)
            );
        
        CreateMap<User, UserSearchDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id));


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



        // Tennis Booking mappings
        CreateMap<TennisBooking, TennisBookingDto>()
            .ForMember(dest => dest.Creator, opt => opt.MapFrom(src => src.Creator))
            .ForMember(dest => dest.Participants, opt => opt.MapFrom(src => src.Participants))
            .ForMember(dest => dest.Requests, opt => opt.MapFrom(src => src.Requests));

        CreateMap<CreateBookingDto, TennisBooking>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentParticipants, opt => opt.Ignore())
            .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Creator, opt => opt.Ignore())
            .ForMember(dest => dest.Participants, opt => opt.Ignore())
            .ForMember(dest => dest.Requests, opt => opt.Ignore());

        CreateMap<UpdateBookingDto, TennisBooking>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentParticipants, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Creator, opt => opt.Ignore())
            .ForMember(dest => dest.Participants, opt => opt.Ignore())
            .ForMember(dest => dest.Requests, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<BookingParticipant, BookingParticipantDto>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User));

        CreateMap<BookingRequest, BookingRequestDto>()
            .ForMember(dest => dest.Requester, opt => opt.MapFrom(src => src.Requester));

    }
    
}