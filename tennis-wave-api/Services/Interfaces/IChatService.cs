using tennis_wave_api.Models.DTOs;

namespace tennis_wave_api.Services.Interfaces
{
    /// <summary>
    /// chat service interface
    /// </summary>
    public interface IChatService
    {
        // chat management
        Task<List<ConversationDto>> GetUserConversationsAsync(int userId);
        Task<ConversationDto?> GetOrCreateConversationAsync(int currentUserId, int otherUserId);
        Task<ConversationDto?> GetConversationByIdAsync(int conversationId, int userId);
        Task<ConversationDto> CreateConversationAsync(int currentUserId, int otherUserId);
        
        // message management
        Task<List<MessageDto>> GetConversationMessagesAsync(int conversationId, int userId, int page = 1, int size = 20);
        Task<MessageDto> SendMessageAsync(int conversationId, SendMessageDto sendDto, int senderId);
        Task<bool> MarkConversationAsReadAsync(int conversationId, int userId);
        
        // statistics management
        Task<int> GetTotalUnreadCountAsync(int userId);
        Task<List<UnreadCountDto>> GetUnreadCountsAsync(int userId);
    }
} 