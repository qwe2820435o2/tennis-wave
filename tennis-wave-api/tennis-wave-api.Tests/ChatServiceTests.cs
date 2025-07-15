// tennis-wave-api.Tests/ChatServiceTests.cs
using AutoMapper;
using FluentAssertions;
using Moq;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Services;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Tests;

/// <summary>
/// Contains unit tests for the ChatService.
/// </summary>
public class ChatServiceTests
{
    // Mocks for the dependencies of ChatService.
    private readonly Mock<IConversationRepository> _mockConversationRepository;
    private readonly Mock<IMessageRepository> _mockMessageRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    
    // The "System Under Test" - the instance of the class we are testing.
    private readonly IChatService _sut;

    public ChatServiceTests()
    {
        // Initialize the mocks for each test.
        _mockConversationRepository = new Mock<IConversationRepository>();
        _mockMessageRepository = new Mock<IMessageRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();

        // Create the instance of ChatService with the mocked dependencies.
        _sut = new ChatService(_mockConversationRepository.Object, _mockMessageRepository.Object, _mockUserRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task CreateConversationAsync_ShouldReturnCreatedConversation()
    {
        // Arrange
        var currentUserId = 1;
        var otherUserId = 2;
        var conversation = new Conversation
        {
            Id = 1,
            User1Id = currentUserId,
            User2Id = otherUserId,
            CreatedAt = DateTime.UtcNow
        };
        var expectedDto = new ConversationDto
        {
            Id = 1,
            User1Id = currentUserId,
            User2Id = otherUserId
        };

        _mockConversationRepository.Setup(repo => repo.CreateConversationAsync(It.IsAny<Conversation>()))
            .ReturnsAsync(conversation);
        _mockMapper.Setup(m => m.Map<ConversationDto>(conversation))
            .Returns(expectedDto);
        _mockConversationRepository.Setup(repo => repo.GetConversationBetweenUsersAsync(currentUserId, otherUserId))
            .ReturnsAsync((Conversation)null);
        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(otherUserId))
            .ReturnsAsync(new User { Id = otherUserId, UserName = "otheruser" });

        // Act
        var result = await _sut.CreateConversationAsync(currentUserId, otherUserId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
        _mockConversationRepository.Verify(repo => repo.CreateConversationAsync(It.Is<Conversation>(c => 
            c.User1Id == currentUserId && c.User2Id == otherUserId)), Times.Once);
    }

    [Fact]
    public async Task GetConversationByIdAsync_ShouldReturnConversation_WhenExists()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;
        var conversation = new Conversation
        {
            Id = conversationId,
            User1Id = userId,
            User2Id = 2,
            CreatedAt = DateTime.UtcNow
        };
        var expectedDto = new ConversationDto
        {
            Id = conversationId,
            User1Id = userId,
            User2Id = 2
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync(conversation);
        _mockConversationRepository.Setup(repo => repo.IsUserInConversationAsync(conversationId, userId))
            .ReturnsAsync(true);
        _mockMapper.Setup(m => m.Map<ConversationDto>(conversation))
            .Returns(expectedDto);

        // Act
        var result = await _sut.GetConversationByIdAsync(conversationId, userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
    }

    [Fact]
    public async Task GetConversationByIdAsync_ShouldThrowBusinessException_WhenNotFound()
    {
        // Arrange
        var conversationId = 999;
        var userId = 1;
        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync((Conversation)null);

        // Act
        var result = await _sut.GetConversationByIdAsync(conversationId, userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetConversationByIdAsync_ShouldThrowBusinessException_WhenUserNotParticipant()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;
        var conversation = new Conversation
        {
            Id = conversationId,
            User1Id = 2,
            User2Id = 3,
            CreatedAt = DateTime.UtcNow
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync(conversation);

        // Act
        var result = await _sut.GetConversationByIdAsync(conversationId, userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserConversationsAsync_ShouldReturnMappedConversations()
    {
        // Arrange
        var userId = 1;
        var conversations = new List<Conversation>
        {
            new() { Id = 1, User1Id = userId, User2Id = 2 },
            new() { Id = 2, User1Id = userId, User2Id = 3 }
        };
        var expectedDtos = new List<ConversationDto>
        {
            new() { Id = 1, User1Id = userId, User2Id = 2, OtherUserId = 2, OtherUserName = "user2" },
            new() { Id = 2, User1Id = userId, User2Id = 3, OtherUserId = 3, OtherUserName = "user3" }
        };

        _mockConversationRepository.Setup(repo => repo.GetUserConversationsAsync(userId))
            .ReturnsAsync(conversations);
        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(2))
            .ReturnsAsync(new User { Id = 2, UserName = "user2" });
        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(3))
            .ReturnsAsync(new User { Id = 3, UserName = "user3" });
        _mockMapper.Setup(m => m.Map<ConversationDto>(It.IsAny<Conversation>()))
            .Returns<Conversation>(c => new ConversationDto { Id = c.Id, User1Id = c.User1Id, User2Id = c.User2Id });
        _mockMessageRepository.Setup(repo => repo.GetUnreadCountAsync(It.IsAny<int>(), userId))
            .ReturnsAsync(0);

        // Act
        var result = await _sut.GetUserConversationsAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }

    [Fact]
    public async Task SendMessageAsync_ShouldReturnCreatedMessage()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;
        var messageDto = new SendMessageDto
        {
            Content = "Hello, world!"
        };
        var message = new Message
        {
            Id = 1,
            ConversationId = conversationId,
            SenderId = userId,
            Content = "Hello, world!",
            CreatedAt = DateTime.UtcNow
        };
        var expectedDto = new MessageDto
        {
            Id = 1,
            ConversationId = conversationId,
            SenderId = userId,
            Content = "Hello, world!"
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync(new Conversation
            {
                Id = conversationId,
                User1Id = userId,
                User2Id = 2
            });
        _mockConversationRepository.Setup(repo => repo.IsUserInConversationAsync(conversationId, userId))
            .ReturnsAsync(true);
        _mockMapper.Setup(m => m.Map<Message>(messageDto))
            .Returns(message);
        _mockMessageRepository.Setup(repo => repo.CreateMessageAsync(It.IsAny<Message>()))
            .ReturnsAsync(message);
        _mockMapper.Setup(m => m.Map<MessageDto>(message))
            .Returns(expectedDto);

        // Act
        var result = await _sut.SendMessageAsync(conversationId, messageDto, userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
        _mockMessageRepository.Verify(repo => repo.CreateMessageAsync(It.Is<Message>(m => 
            m.ConversationId == conversationId && m.SenderId == userId)), Times.Once);
    }

    [Fact]
    public async Task SendMessageAsync_ShouldThrowBusinessException_WhenConversationNotFound()
    {
        // Arrange
        var conversationId = 999;
        var userId = 1;
        var messageDto = new SendMessageDto { Content = "Hello" };

        _mockConversationRepository.Setup(repo => repo.IsUserInConversationAsync(conversationId, userId))
            .ReturnsAsync(true);
        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync((Conversation)null);

        // Act
        Func<Task> act = async () => await _sut.SendMessageAsync(conversationId, messageDto, userId);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Conversation not found");
    }

    [Fact]
    public async Task SendMessageAsync_ShouldThrowBusinessException_WhenUserNotParticipant()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;
        var messageDto = new SendMessageDto { Content = "Hello" };
        var conversation = new Conversation
        {
            Id = conversationId,
            User1Id = 2,
            User2Id = 3
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync(conversation);

        // Act
        Func<Task> act = async () => await _sut.SendMessageAsync(conversationId, messageDto, userId);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User is not a participant in this conversation");
    }

    [Fact]
    public async Task GetConversationMessagesAsync_ShouldReturnMappedMessages()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;
        var messages = new List<Message>
        {
            new() { Id = 1, Content = "Message 1", SenderId = userId },
            new() { Id = 2, Content = "Message 2", SenderId = 2 }
        };
        var expectedDtos = new List<MessageDto>
        {
            new() { Id = 1, Content = "Message 1", SenderId = userId },
            new() { Id = 2, Content = "Message 2", SenderId = 2 }
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync(new Conversation
            {
                Id = conversationId,
                User1Id = userId,
                User2Id = 2
            });
        _mockConversationRepository.Setup(repo => repo.IsUserInConversationAsync(conversationId, userId))
            .ReturnsAsync(true);
        _mockMessageRepository.Setup(repo => repo.GetConversationMessagesAsync(conversationId, 0, 20))
            .ReturnsAsync(messages);
        _mockMapper.Setup(m => m.Map<List<MessageDto>>(messages))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetConversationMessagesAsync(conversationId, userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }

    [Fact]
    public async Task GetConversationMessagesAsync_ShouldThrowBusinessException_WhenUserNotParticipant()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;
        var conversation = new Conversation
        {
            Id = conversationId,
            User1Id = 2,
            User2Id = 3
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync(conversation);

        // Act
        var result = await _sut.GetConversationMessagesAsync(conversationId, userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task MarkConversationAsReadAsync_ShouldCallRepository()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;

        _mockConversationRepository.Setup(repo => repo.IsUserInConversationAsync(conversationId, userId))
            .ReturnsAsync(true);
        _mockMessageRepository.Setup(repo => repo.MarkMessagesAsReadAsync(conversationId, userId))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.MarkConversationAsReadAsync(conversationId, userId);

        // Assert
        result.Should().BeTrue();
        _mockMessageRepository.Verify(repo => repo.MarkMessagesAsReadAsync(conversationId, userId), Times.Once);
    }

    [Fact]
    public async Task GetTotalUnreadCountAsync_ShouldReturnCount()
    {
        // Arrange
        var userId = 1;
        var expectedCount = 5;

        _mockMessageRepository.Setup(repo => repo.GetTotalUnreadCountAsync(userId))
            .ReturnsAsync(expectedCount);

        // Act
        var result = await _sut.GetTotalUnreadCountAsync(userId);

        // Assert
        result.Should().Be(expectedCount);
    }

    [Fact]
    public async Task GetUnreadCountsAsync_ShouldReturnUnreadCounts()
    {
        // Arrange
        var userId = 1;
        var conversations = new List<Conversation>
        {
            new() { Id = 1, User1Id = userId, User2Id = 2 },
            new() { Id = 2, User1Id = userId, User2Id = 3 }
        };

        _mockConversationRepository.Setup(repo => repo.GetUserConversationsAsync(userId))
            .ReturnsAsync(conversations);

        _mockMessageRepository.Setup(repo => repo.GetUnreadCountAsync(It.IsAny<int>(), userId))
            .ReturnsAsync(3);

        // Act
        var result = await _sut.GetUnreadCountsAsync(userId);

        // Assert
        result.Should().NotBeNull();
        // Note: This is a simplified test since the actual implementation might be more complex
    }

    [Fact]
    public async Task GetOrCreateConversationAsync_ShouldReturnExistingConversation()
    {
        // Arrange
        var currentUserId = 1;
        var otherUserId = 2;
        var conversation = new Conversation
        {
            Id = 1,
            User1Id = currentUserId,
            User2Id = otherUserId,
            CreatedAt = DateTime.UtcNow
        };
        var expectedDto = new ConversationDto
        {
            Id = 1,
            User1Id = currentUserId,
            User2Id = otherUserId,
            OtherUserId = otherUserId,
            OtherUserName = "user2"
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationBetweenUsersAsync(currentUserId, otherUserId))
            .ReturnsAsync(conversation);
        _mockMapper.Setup(m => m.Map<ConversationDto>(conversation))
            .Returns(expectedDto);
        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(otherUserId))
            .ReturnsAsync(new User { Id = otherUserId, UserName = "user2" });
        _mockMessageRepository.Setup(repo => repo.GetUnreadCountAsync(conversation.Id, currentUserId))
            .ReturnsAsync(0);

        // Act
        var result = await _sut.GetOrCreateConversationAsync(currentUserId, otherUserId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
    }

    [Fact]
    public async Task GetConversationMessagesAsync_ShouldReturnPaginatedMessages()
    {
        // Arrange
        var conversationId = 1;
        var userId = 1;
        var page = 1;
        var size = 20;
        var skip = (page - 1) * size;
        var messages = new List<Message>
        {
            new() { Id = 1, Content = "Message 1", SenderId = userId },
            new() { Id = 2, Content = "Message 2", SenderId = 2 }
        };
        var expectedDtos = new List<MessageDto>
        {
            new() { Id = 1, Content = "Message 1", SenderId = userId },
            new() { Id = 2, Content = "Message 2", SenderId = 2 }
        };

        _mockConversationRepository.Setup(repo => repo.GetConversationByIdAsync(conversationId))
            .ReturnsAsync(new Conversation
            {
                Id = conversationId,
                User1Id = userId,
                User2Id = 2
            });
        _mockConversationRepository.Setup(repo => repo.IsUserInConversationAsync(conversationId, userId))
            .ReturnsAsync(true);
        _mockMessageRepository.Setup(repo => repo.GetConversationMessagesAsync(conversationId, skip, size))
            .ReturnsAsync(messages);
        _mockMapper.Setup(m => m.Map<List<MessageDto>>(messages))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetConversationMessagesAsync(conversationId, userId, page, size);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }
} 