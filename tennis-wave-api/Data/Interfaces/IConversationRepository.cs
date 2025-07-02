using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data.Interfaces;

public interface IConversationRepository
{
    Task<List<Conversation>> GetUserConversationsAsync(int userId);
    Task<Conversation?> GetConversationBetweenUsersAsync(int user1Id, int user2Id);
    Task<Conversation?> GetConversationByIdAsync(int conversationId);
    Task<Conversation> CreateConversationAsync(Conversation conversation);
    Task<Conversation> UpdateConversationAsync(Conversation conversation);
    Task<bool> IsUserInConversationAsync(int conversationId, int userId);
}