using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using tennis_wave_api.Services.Interfaces;
using tennis_wave_api.Models.DTOs;

namespace tennis_wave_api.Services
{
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly IUserService _userService;

        public ChatHub(IChatService chatService, IUserService userService)
        {
            _chatService = chatService;
            _userService = userService;
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"SignalR Connection: {Context.ConnectionId} - User authenticated: {Context.User?.Identity?.IsAuthenticated}");
            
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int userIdInt))
            {
                // Add user to their personal group for receiving messages
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                
                // 自动加入所有会话 group
                var conversations = await _chatService.GetUserConversationsAsync(userIdInt);
                foreach (var conv in conversations)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conv.Id}");
                    Console.WriteLine($"User {userIdInt} joined group conversation_{conv.Id}");
                }

                // Update user's online status
                await _userService.UpdateUserOnlineStatusAsync(userIdInt, true);
                
                Console.WriteLine($"User {userIdInt} connected to SignalR");
            }
            else
            {
                Console.WriteLine($"Failed to get user ID for connection {Context.ConnectionId}");
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int userIdInt))
            {
                // Update user's online status
                await _userService.UpdateUserOnlineStatusAsync(userIdInt, false);
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinConversation(string conversationId)
        {
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                // Add user to conversation group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
            }
        }

        public async Task LeaveConversation(string conversationId)
        {
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                // Remove user from conversation group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
            }
        }

        public async Task SendMessage(string conversationId, string content)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            if (!int.TryParse(conversationId, out int conversationIdInt))
            {
                throw new ArgumentException("Invalid conversation ID");
            }

            // Create SendMessageDto
            var sendMessageDto = new tennis_wave_api.Models.DTOs.SendMessageDto
            {
                Content = content
            };

            // Save message to database
            var messageDto = await _chatService.SendMessageAsync(conversationIdInt, sendMessageDto, userIdInt);

            Console.WriteLine($"[SignalR] Broadcasting to group conversation_{conversationId}, message: {System.Text.Json.JsonSerializer.Serialize(messageDto)}");

            // Broadcast message to all users in the conversation
            await Clients.Group($"conversation_{conversationId}").SendAsync("ReceiveMessage", messageDto);
        }

        public async Task MarkAsRead(string conversationId)
        {
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int userIdInt) && 
                int.TryParse(conversationId, out int conversationIdInt))
            {
                await _chatService.MarkConversationAsReadAsync(conversationIdInt, userIdInt);
                
                // Notify other users in conversation that messages have been read
                await Clients.Group($"conversation_{conversationId}").SendAsync("MessagesRead", conversationId, userId);
            }
        }

        private string? GetCurrentUserId()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"GetCurrentUserId: User authenticated: {Context.User?.Identity?.IsAuthenticated}, UserId: {userId}");
            return userId;
        }
    }
} 