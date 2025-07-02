namespace tennis_wave_api.Models.DTOs
{
    /// <summary>
    /// Conversation DTO
    /// </summary>
    public class ConversationDto
    {
        public int Id { get; set; }
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public string User1Name { get; set; } = string.Empty;
        public string User2Name { get; set; } = string.Empty;
        public string? User1Avatar { get; set; }
        public string? User2Avatar { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public string? LastMessage { get; set; }
        public int UnreadCount { get; set; }
        public int OtherUserId { get; set; } // Other user ID for current user's perspective
        public string OtherUserName { get; set; } = string.Empty; // Other user's name
        public string? OtherUserAvatar { get; set; } // Other user's avatar
    }

    /// <summary>
    /// Message DTO
    /// </summary>
    public class MessageDto
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderAvatar { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool? IsRead { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool IsFromCurrentUser { get; set; }
    }

    /// <summary>
    /// Send Message DTO
    /// </summary>
    public class SendMessageDto
    {
        public string Content { get; set; } = string.Empty;
    }

    /// <summary>
    /// Unread Count DTO
    /// </summary>
    public class UnreadCountDto
    {
        public int ConversationId { get; set; }
        public int UnreadCount { get; set; }
    }
}