using Microsoft.EntityFrameworkCore;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly ApplicationDbContext _context;

        public MessageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // MessageRepository.cs
        public async Task<List<Message>> GetConversationMessagesAsync(int conversationId, int skip = 0, int take = 20)
        {
            return await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .Include(m => m.Sender)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<Message> CreateMessageAsync(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<bool> MarkMessagesAsReadAsync(int conversationId, int userId)
        {
            var unreadMessages = await _context.Messages
                .Where(m => m.ConversationId == conversationId &&
                            m.SenderId != userId &&
                            m.IsRead == false)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync(int conversationId, int userId)
        {
            return await _context.Messages
                .CountAsync(m => m.ConversationId == conversationId &&
                                 m.SenderId != userId &&
                                 m.IsRead == false);
        }

        public async Task<int> GetTotalUnreadCountAsync(int userId)
        {
            return await _context.Messages
                .Where(m => m.SenderId != userId && m.IsRead == false)
                .Where(m => _context.Conversations
                    .Any(c => c.Id == m.ConversationId &&
                              (c.User1Id == userId || c.User2Id == userId)))
                .CountAsync();
        }
    }
}