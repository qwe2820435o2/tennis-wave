using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using tennis_wave_api.Helpers;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Services.Interfaces;
using System.Security.Claims;
using tennis_wave_api.Models;

namespace tennis_wave_api.Controllers
{
    /// <summary>
    /// Chat controller
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        /// <summary>
        /// Get all conversations for the current user
        /// </summary>
        [HttpGet("conversations")]
        public async Task<ActionResult<ApiResponse<List<ConversationDto>>>> GetConversations()
        {
            try
            {
                var userId = GetCurrentUserId();
                var conversations = await _chatService.GetUserConversationsAsync(userId);
                return Ok(ApiResponseHelper.Success(conversations));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<List<ConversationDto>>(ex.Message));
            }
        }
        
        [HttpPost("conversations")]
        public async Task<ActionResult<ApiResponse<ConversationDto>>> CreateConversation([FromBody] CreateConversationDto dto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var conversation = await _chatService.CreateConversationAsync(currentUserId, dto.OtherUserId);
                return Ok(ApiResponseHelper.Success(conversation));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<ConversationDto>(ex.Message));
            }
        }

        /// <summary>
        /// Get or create a private conversation with specified user
        /// </summary>
        [HttpGet("conversations/with/{userId}")]
        public async Task<ActionResult<ApiResponse<ConversationDto>>> GetOrCreateConversation(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var conversation = await _chatService.GetOrCreateConversationAsync(currentUserId, userId);
                
                if (conversation == null)
                    return BadRequest(ApiResponseHelper.Fail<ConversationDto>("Failed to get or create conversation"));

                return Ok(ApiResponseHelper.Success(conversation));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<ConversationDto>(ex.Message));
            }
        }

        /// <summary>
        /// Get conversation details
        /// </summary>
        [HttpGet("conversations/{conversationId}")]
        public async Task<ActionResult<ApiResponse<ConversationDto>>> GetConversation(int conversationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var conversation = await _chatService.GetConversationByIdAsync(conversationId, userId);
                
                if (conversation == null)
                    return NotFound(ApiResponseHelper.Fail<ConversationDto>("Conversation not found"));

                return Ok(ApiResponseHelper.Success(conversation));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<ConversationDto>(ex.Message));
            }
        }

        /// <summary>
        /// Get conversation messages
        /// </summary>
        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<ApiResponse<ChatMessagesWithOtherUserDto>>> GetMessages(
            int conversationId, 
            [FromQuery] int page = 1, 
            [FromQuery] int size = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                var messages = await _chatService.GetConversationMessagesAsync(conversationId, userId, page, size);
                var conversation = await _chatService.GetConversationByIdAsync(conversationId, userId);
                if (conversation == null)
                    return NotFound(ApiResponseHelper.Fail<ChatMessagesWithOtherUserDto>("Conversation not found"));

                var result = new ChatMessagesWithOtherUserDto
                {
                    Messages = messages,
                    OtherUserId = conversation.OtherUserId,
                    OtherUserName = conversation.OtherUserName,
                    OtherUserAvatar = conversation.OtherUserAvatar
                };
                return Ok(ApiResponseHelper.Success(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<ChatMessagesWithOtherUserDto>(ex.Message));
            }
        }

        /// <summary>
        /// Send a message
        /// </summary>
        [HttpPost("conversations/{conversationId}/messages")]
        public async Task<ActionResult<ApiResponse<MessageDto>>> SendMessage(
            int conversationId, 
            [FromBody] SendMessageDto sendDto)
        {
            try
            {
                var senderId = GetCurrentUserId();
                var message = await _chatService.SendMessageAsync(conversationId, sendDto, senderId);
                return Ok(ApiResponseHelper.Success(message, "Message sent successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<MessageDto>(ex.Message));
            }
        }

        /// <summary>
        /// Mark conversation as read
        /// </summary>
        [HttpPost("conversations/{conversationId}/read")]
        public async Task<ActionResult<ApiResponse<object>>> MarkAsRead(int conversationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _chatService.MarkConversationAsReadAsync(conversationId, userId);
                
                if (!success)
                    return BadRequest(ApiResponseHelper.Fail<object>("Failed to mark conversation as read"));

                return Ok(ApiResponseHelper.Success<object>(null, "Messages marked as read"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<object>(ex.Message));
            }
        }

        /// <summary>
        /// Get total unread message count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var unreadCount = await _chatService.GetTotalUnreadCountAsync(userId);
                return Ok(ApiResponseHelper.Success(unreadCount));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<int>(ex.Message));
            }
        }

        /// <summary>
        /// Get unread message counts for all conversations
        /// </summary>
        [HttpGet("unread-counts")]
        public async Task<ActionResult<ApiResponse<List<UnreadCountDto>>>> GetUnreadCounts()
        {
            try
            {
                var userId = GetCurrentUserId();
                var unreadCounts = await _chatService.GetUnreadCountsAsync(userId);
                return Ok(ApiResponseHelper.Success(unreadCounts));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseHelper.Fail<List<UnreadCountDto>>(ex.Message));
            }
        }

        /// <summary>
        /// Get current user ID from JWT token
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }
        
    }
} 