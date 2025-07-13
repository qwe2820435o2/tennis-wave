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
                try
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
                    
                    Console.WriteLine($"User {userIdInt} connected to SignalR successfully");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error during OnConnectedAsync for user {userIdInt}: {ex.Message}");
                }
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
                try
                {
                    // Update user's online status
                    await _userService.UpdateUserOnlineStatusAsync(userIdInt, false);
                    Console.WriteLine($"User {userIdInt} disconnected from SignalR");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error during OnDisconnectedAsync for user {userIdInt}: {ex.Message}");
                }
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinConversation(string conversationId)
        {
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                try
                {
                    // Add user to conversation group
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
                    Console.WriteLine($"User {userId} joined conversation {conversationId}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error joining conversation {conversationId} for user {userId}: {ex.Message}");
                    throw;
                }
            }
            else
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
        }

        public async Task LeaveConversation(string conversationId)
        {
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                try
                {
                    // Remove user from conversation group
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
                    Console.WriteLine($"User {userId} left conversation {conversationId}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error leaving conversation {conversationId} for user {userId}: {ex.Message}");
                }
            }
        }

        public async Task SendMessage(string conversationId, string content)
        {
            Console.WriteLine($"[SignalR] SendMessage called - Conversation: {conversationId}, Content: {content}");
            
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt))
            {
                Console.WriteLine($"[SignalR] SendMessage failed - User not authenticated");
                throw new UnauthorizedAccessException("User not authenticated");
            }

            if (!int.TryParse(conversationId, out int conversationIdInt))
            {
                Console.WriteLine($"[SignalR] SendMessage failed - Invalid conversation ID: {conversationId}");
                throw new ArgumentException("Invalid conversation ID");
            }

            if (string.IsNullOrWhiteSpace(content))
            {
                Console.WriteLine($"[SignalR] SendMessage failed - Empty content");
                throw new ArgumentException("Message content cannot be empty");
            }

            try
            {
                // Create SendMessageDto
                var sendMessageDto = new tennis_wave_api.Models.DTOs.SendMessageDto
                {
                    Content = content.Trim()
                };

                Console.WriteLine($"[SignalR] Saving message to database - User: {userIdInt}, Conversation: {conversationIdInt}");

                // Save message to database
                var messageDto = await _chatService.SendMessageAsync(conversationIdInt, sendMessageDto, userIdInt);

                Console.WriteLine($"[SignalR] Message saved successfully - Message ID: {messageDto.Id}");

                // Broadcast message to all users in the conversation
                var groupName = $"conversation_{conversationId}";
                Console.WriteLine($"[SignalR] Broadcasting to group {groupName}, message: {System.Text.Json.JsonSerializer.Serialize(messageDto)}");
                
                await Clients.Group(groupName).SendAsync("ReceiveMessage", messageDto);
                
                Console.WriteLine($"[SignalR] Message broadcasted successfully to group {groupName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SignalR] SendMessage failed - Error: {ex.Message}");
                Console.WriteLine($"[SignalR] SendMessage failed - Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task MarkAsRead(string conversationId)
        {
            var userId = GetCurrentUserId();
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int userIdInt) && 
                int.TryParse(conversationId, out int conversationIdInt))
            {
                try
                {
                    await _chatService.MarkConversationAsReadAsync(conversationIdInt, userIdInt);
                    Console.WriteLine($"User {userIdInt} marked conversation {conversationId} as read");
                    
                    // Notify other users in conversation that messages have been read
                    await Clients.Group($"conversation_{conversationId}").SendAsync("MessagesRead", conversationId, userId);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error marking conversation {conversationId} as read for user {userIdInt}: {ex.Message}");
                }
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