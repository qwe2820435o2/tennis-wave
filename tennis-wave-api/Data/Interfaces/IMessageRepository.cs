using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data.Interfaces;

public interface IMessageRepository
{
    Task<List<Message>> GetConversationMessagesAsync(int conversationId, int skip = 0, int take = 20);
    Task<Message> CreateMessageAsync(Message message);
    Task<bool> MarkMessagesAsReadAsync(int conversationId, int userId);
    Task<int> GetUnreadCountAsync(int conversationId, int userId);
    Task<int> GetTotalUnreadCountAsync(int userId);
}