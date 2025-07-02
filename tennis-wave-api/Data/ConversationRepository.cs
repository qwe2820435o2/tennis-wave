// Data/ConversationRepository.cs

using Microsoft.EntityFrameworkCore;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Models.Entities;

namespace tennis_wave_api.Data
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly ApplicationDbContext _context;

        public ConversationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Conversation>> GetUserConversationsAsync(int userId)
        {
            return await _context.Conversations
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .Include(c => c.User1)
                .Include(c => c.User2)
                .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .OrderByDescending(c => c.LastMessageAt.HasValue ? c.LastMessageAt.Value : c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Conversation?> GetConversationBetweenUsersAsync(int user1Id, int user2Id)
        {
            // Ensure User1Id < User2Id
            var minUserId = Math.Min(user1Id, user2Id);
            var maxUserId = Math.Max(user1Id, user2Id);

            return await _context.Conversations
                .Where(c => c.User1Id == minUserId && c.User2Id == maxUserId)
                .Include(c => c.User1)
                .Include(c => c.User2)
                .FirstOrDefaultAsync();
        }

        public async Task<Conversation?> GetConversationByIdAsync(int conversationId)
        {
            return await _context.Conversations
                .Where(c => c.Id == conversationId)
                .Include(c => c.User1)
                .Include(c => c.User2)
                .FirstOrDefaultAsync();
        }

        public async Task<Conversation> CreateConversationAsync(Conversation conversation)
        {
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task<Conversation> UpdateConversationAsync(Conversation conversation)
        {
            _context.Conversations.Update(conversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task<bool> IsUserInConversationAsync(int conversationId, int userId)
        {
            return await _context.Conversations
                .AnyAsync(c => c.Id == conversationId && (c.User1Id == userId || c.User2Id == userId));
        }
    }
}
