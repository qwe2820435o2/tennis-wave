using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Services.Interfaces;
using AutoMapper;
using tennis_wave_api.Extensions;

namespace tennis_wave_api.Services
{
    /// <summary>
    /// chat service implementation
    /// </summary>
    public class ChatService : IChatService
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public ChatService(
            IConversationRepository conversationRepository,
            IMessageRepository messageRepository,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _conversationRepository = conversationRepository;
            _messageRepository = messageRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<List<ConversationDto>> GetUserConversationsAsync(int userId)
        {
            var conversations = await _conversationRepository.GetUserConversationsAsync(userId);
            var conversationDtos = new List<ConversationDto>();

            foreach (var conversation in conversations)
            {
                var dto = await MapConversationToDtoAsync(conversation, userId);
                conversationDtos.Add(dto);
            }

            return conversationDtos;
        }

        public async Task<ConversationDto?> GetOrCreateConversationAsync(int currentUserId, int otherUserId)
        {
            // Check if conversation already exists
            var existingConversation = await _conversationRepository.GetConversationBetweenUsersAsync(currentUserId, otherUserId);
            
            if (existingConversation != null)
            {
                return await MapConversationToDtoAsync(existingConversation, currentUserId);
            }

            // Create new conversation
            var conversation = new Conversation
            {
                User1Id = Math.Min(currentUserId, otherUserId),
                User2Id = Math.Max(currentUserId, otherUserId),
                CreatedAt = DateTime.UtcNow
            };

            var createdConversation = await _conversationRepository.CreateConversationAsync(conversation);
            return await MapConversationToDtoAsync(createdConversation, currentUserId);
        }

        public async Task<ConversationDto?> GetConversationByIdAsync(int conversationId, int userId)
        {
            var conversation = await _conversationRepository.GetConversationByIdAsync(conversationId);
            if (conversation == null)
                return null;

            if (!await _conversationRepository.IsUserInConversationAsync(conversationId, userId))
                return null;

            return await MapConversationToDtoAsync(conversation, userId);
        }

        public async Task<ConversationDto> CreateConversationAsync(int currentUserId, int otherUserId)
        {
            if (currentUserId == otherUserId)
            {
                throw new BusinessException("Cannot create a conversation with yourself.");
            }

            // check user 
            var otherUser = await _userRepository.GetUserByIdAsync(otherUserId);
            if (otherUser == null)
            {
                throw new BusinessException("User not found.");
            }

            // check conversation
            var existingConversation = await _conversationRepository.GetConversationBetweenUsersAsync(currentUserId, otherUserId);
            if (existingConversation != null)
            {
                return await MapConversationToDtoAsync(existingConversation, currentUserId);
            }

            // create conversation
            var conversation = new Conversation
            {
                User1Id = Math.Min(currentUserId, otherUserId),
                User2Id = Math.Max(currentUserId, otherUserId),
                CreatedAt = DateTime.UtcNow
            };

            var createdConversation = await _conversationRepository.CreateConversationAsync(conversation);

            return await MapConversationToDtoAsync(createdConversation, currentUserId);
        }

        public async Task<List<MessageDto>> GetConversationMessagesAsync(int conversationId, int userId, int page = 1, int size = 20)
        {
            if (!await _conversationRepository.IsUserInConversationAsync(conversationId, userId))
                return new List<MessageDto>();

            var skip = (page - 1) * size;
            var messages = await _messageRepository.GetConversationMessagesAsync(conversationId, skip, size);
            
            // Use AutoMapper to map messages
            var messageDtos = _mapper.Map<List<MessageDto>>(messages);
            
            // Set IsFromCurrentUser property manually
            foreach (var dto in messageDtos)
            {
                dto.IsFromCurrentUser = dto.SenderId == userId;
            }

            return messageDtos;
        }

        public async Task<MessageDto> SendMessageAsync(int conversationId, SendMessageDto sendDto, int senderId)
        {
            Console.WriteLine($"[ChatService] SendMessageAsync called - Conversation: {conversationId}, Sender: {senderId}, Content: {sendDto.Content}");
            
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(sendDto.Content))
                {
                    throw new ArgumentException("Message content cannot be empty");
                }

                // Check if user is in conversation
                if (!await _conversationRepository.IsUserInConversationAsync(conversationId, senderId))
                {
                    Console.WriteLine($"[ChatService] SendMessageAsync failed - User {senderId} is not in conversation {conversationId}");
                    throw new UnauthorizedAccessException("User is not a participant in this conversation");
                }

                // Check if conversation exists
                var conversation = await _conversationRepository.GetConversationByIdAsync(conversationId);
                if (conversation == null)
                {
                    Console.WriteLine($"[ChatService] SendMessageAsync failed - Conversation {conversationId} not found");
                    throw new ArgumentException("Conversation not found");
                }

                // Use AutoMapper to create message
                var message = _mapper.Map<Message>(sendDto);
                message.ConversationId = conversationId;
                message.SenderId = senderId;
                message.CreatedAt = DateTime.UtcNow;
                message.IsRead = false;

                Console.WriteLine($"[ChatService] Creating message in database...");

                // Save message to database
                var createdMessage = await _messageRepository.CreateMessageAsync(message);

                Console.WriteLine($"[ChatService] Message created successfully - ID: {createdMessage.Id}");

                // Update conversation's last message time
                conversation.LastMessageAt = DateTime.UtcNow;
                await _conversationRepository.UpdateConversationAsync(conversation);

                Console.WriteLine($"[ChatService] Conversation last message time updated");

                // Use AutoMapper to map response
                var messageDto = _mapper.Map<MessageDto>(createdMessage);
                messageDto.IsFromCurrentUser = true;

                Console.WriteLine($"[ChatService] SendMessageAsync completed successfully - Message ID: {messageDto.Id}");

                return messageDto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChatService] SendMessageAsync failed - Error: {ex.Message}");
                Console.WriteLine($"[ChatService] SendMessageAsync failed - Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> MarkConversationAsReadAsync(int conversationId, int userId)
        {
            if (!await _conversationRepository.IsUserInConversationAsync(conversationId, userId))
                return false;

            return await _messageRepository.MarkMessagesAsReadAsync(conversationId, userId);
        }

        public async Task<int> GetTotalUnreadCountAsync(int userId)
        {
            return await _messageRepository.GetTotalUnreadCountAsync(userId);
        }

        public async Task<List<UnreadCountDto>> GetUnreadCountsAsync(int userId)
        {
            var conversations = await _conversationRepository.GetUserConversationsAsync(userId);
            var unreadCounts = new List<UnreadCountDto>();

            foreach (var conversation in conversations)
            {
                var unreadCount = await _messageRepository.GetUnreadCountAsync(conversation.Id, userId);
                if (unreadCount > 0)
                {
                    unreadCounts.Add(new UnreadCountDto
                    {
                        ConversationId = conversation.Id,
                        UnreadCount = unreadCount
                    });
                }
            }

            return unreadCounts;
        }

        private async Task<ConversationDto> MapConversationToDtoAsync(Conversation conversation, int currentUserId)
        {
            // Use AutoMapper to map conversation
            var dto = _mapper.Map<ConversationDto>(conversation);
            
            // Set additional properties manually
            var otherUserId = conversation.User1Id == currentUserId ? conversation.User2Id : conversation.User1Id;
            var otherUser = await _userRepository.GetUserByIdAsync(otherUserId);
            var unreadCount = await _messageRepository.GetUnreadCountAsync(conversation.Id, currentUserId);

            dto.OtherUserId = otherUserId;
            dto.OtherUserName = otherUser?.UserName ?? "Unknown User";
            dto.OtherUserAvatar = otherUser?.Avatar;
            dto.UnreadCount = unreadCount;

            return dto;
        }


    }
} 