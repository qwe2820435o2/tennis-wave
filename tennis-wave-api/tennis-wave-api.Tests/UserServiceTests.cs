// tennis-wave-api.Tests/UserServiceTests.cs
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
/// Contains unit tests for the UserService.
/// </summary>
public class UserServiceTests
{
    // Mocks for the dependencies of UserService.
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    
    // The "System Under Test" - the instance of the class we are testing.
    private readonly IUserService _sut;

    public UserServiceTests()
    {
        // Initialize the mocks for each test.
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();

        // Create the instance of UserService with the mocked dependencies.
        _sut = new UserService(_mockUserRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task GetAllUsersAsync_ShouldReturnMappedUsers()
    {
        // Arrange
        var users = new List<User>
        {
            new() { Id = 1, UserName = "user1", Email = "user1@test.com" },
            new() { Id = 2, UserName = "user2", Email = "user2@test.com" }
        };
        var expectedDtos = new List<UserDto>
        {
            new() { Id = "1", UserName = "user1", Email = "user1@test.com" },
            new() { Id = "2", UserName = "user2", Email = "user2@test.com" }
        };

        _mockUserRepository.Setup(repo => repo.GetAllUsersAsync())
            .ReturnsAsync(users);
        _mockMapper.Setup(m => m.Map<IEnumerable<UserDto>>(users))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetAllUsersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }

    [Fact]
    public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var userId = 1;
        var user = new User { Id = userId, UserName = "testuser", Email = "test@test.com" };
        var expectedDto = new UserDto { Id = userId.ToString(), UserName = "testuser", Email = "test@test.com" };

        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _mockMapper.Setup(m => m.Map<UserDto>(user))
            .Returns(expectedDto);

        // Act
        var result = await _sut.GetUserByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
    }

    [Fact]
    public async Task GetUserByIdAsync_ShouldThrowBusinessException_WhenUserNotFound()
    {
        // Arrange
        var userId = 999;

        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
            .ThrowsAsync(new KeyNotFoundException());

        // Act
        Func<Task> act = async () => await _sut.GetUserByIdAsync(userId);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage($"User {userId} is not exist");
    }

    [Fact]
    public async Task CreateUserAsync_ShouldReturnCreatedUser()
    {
        // Arrange
        var createUserDto = new CreateUserDto
        {
            UserName = "newuser",
            Email = "new@test.com",
            Bio = "Test bio"
        };
        var createdUser = new User { Id = 1, UserName = "newuser", Email = "new@test.com", Bio = "Test bio" };
        var expectedDto = new UserDto { Id = "1", UserName = "newuser", Email = "new@test.com", Bio = "Test bio" };

        _mockUserRepository.Setup(repo => repo.CreateUserAsync(It.IsAny<User>()))
            .ReturnsAsync(createdUser);
        _mockMapper.Setup(m => m.Map<User>(createUserDto))
            .Returns(createdUser);
        _mockMapper.Setup(m => m.Map<UserDto>(createdUser))
            .Returns(expectedDto);

        // Act
        var result = await _sut.CreateUserAsync(createUserDto);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
        _mockUserRepository.Verify(repo => repo.CreateUserAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldReturnUpdatedUser()
    {
        // Arrange
        var userId = 1;
        var updateUserDto = new UpdateUserDto
        {
            UserName = "updateduser",
            Bio = "Updated bio"
        };
        var existingUser = new User { Id = userId, UserName = "olduser", Bio = "Old bio" };
        var updatedUser = new User { Id = userId, UserName = "updateduser", Bio = "Updated bio" };
        var expectedDto = new UserDto { Id = userId.ToString(), UserName = "updateduser", Bio = "Updated bio" };

        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(repo => repo.UpdateUserAsync(It.IsAny<User>()))
            .ReturnsAsync(updatedUser);
        _mockMapper.Setup(m => m.Map<UserDto>(updatedUser))
            .Returns(expectedDto);

        // Act
        var result = await _sut.UpdateUserAsync(userId, updateUserDto);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
        _mockUserRepository.Verify(repo => repo.UpdateUserAsync(It.Is<User>(u => 
            u.UserName == "updateduser" && u.Bio == "Updated bio")), Times.Once);
    }

    [Fact]
    public async Task DeleteUserAsync_ShouldCallRepository()
    {
        // Arrange
        var userId = 1;

        _mockUserRepository.Setup(repo => repo.DeleteUserAsync(userId))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.DeleteUserAsync(userId);

        // Assert
        _mockUserRepository.Verify(repo => repo.DeleteUserAsync(userId), Times.Once);
    }

    [Fact]
    public async Task ChangePasswordAsync_ShouldReturnTrue_WhenPasswordChanged()
    {
        // Arrange
        var userId = 1;
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "oldpassword",
            NewPassword = "newpassword"
        };
        var user = new User 
        { 
            Id = userId, 
            PasswordHash = Convert.ToBase64String(System.Security.Cryptography.SHA256.Create().ComputeHash(System.Text.Encoding.UTF8.GetBytes("oldpassword")))
        };

        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _mockUserRepository.Setup(repo => repo.UpdateUserAsync(It.IsAny<User>()))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.ChangePasswordAsync(userId, changePasswordDto);

        // Assert
        result.Should().BeTrue();
        _mockUserRepository.Verify(repo => repo.UpdateUserAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task ChangePasswordAsync_ShouldThrowBusinessException_WhenCurrentPasswordIncorrect()
    {
        // Arrange
        var userId = 1;
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "wrongpassword",
            NewPassword = "newpassword"
        };
        var user = new User 
        { 
            Id = userId, 
            PasswordHash = Convert.ToBase64String(System.Security.Cryptography.SHA256.Create().ComputeHash(System.Text.Encoding.UTF8.GetBytes("correctpassword")))
        };

        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        Func<Task> act = async () => await _sut.ChangePasswordAsync(userId, changePasswordDto);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("Current password is incorrect");
    }

    [Fact]
    public async Task IsEmailUniqueAsync_ShouldReturnTrue_WhenEmailIsUnique()
    {
        // Arrange
        var email = "unique@test.com";

        _mockUserRepository.Setup(repo => repo.IsEmailUniqueAsync(email, null))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.IsEmailUniqueAsync(email);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsUserNameUniqueAsync_ShouldReturnFalse_WhenUserNameExists()
    {
        // Arrange
        var userName = "existinguser";

        _mockUserRepository.Setup(repo => repo.IsUserNameUniqueAsync(userName, null))
            .ReturnsAsync(false);

        // Act
        var result = await _sut.IsUserNameUniqueAsync(userName);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SearchUsersAsync_ShouldReturnMappedResults()
    {
        // Arrange
        var query = "test";
        var excludeUserId = 1;
        var users = new List<User>
        {
            new() { Id = 2, UserName = "testuser1" },
            new() { Id = 3, UserName = "testuser2" }
        };
        var expectedDtos = new List<UserSearchDto>
        {
            new() { UserId = 2, Keyword = "testuser1" },
            new() { UserId = 3, Keyword = "testuser2" }
        };

        _mockUserRepository.Setup(repo => repo.SearchUsersAsync(query, excludeUserId))
            .ReturnsAsync(users);
        _mockMapper.Setup(m => m.Map<List<UserSearchDto>>(users))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.SearchUsersAsync(query, excludeUserId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }

    [Fact]
    public async Task GetRecommendedPartnersAsync_ShouldReturnRecommendedUsers()
    {
        // Arrange
        var userId = 1;
        var user = new User { Id = userId, TennisLevel = "Intermediate", PreferredLocation = "Central Park" };
        var allUsers = new List<User>
        {
            new() { Id = 2, TennisLevel = "Intermediate", PreferredLocation = "Central Park", CreatedAt = DateTime.UtcNow.AddDays(-1) },
            new() { Id = 3, TennisLevel = "Advanced", PreferredLocation = "Central Park", CreatedAt = DateTime.UtcNow.AddDays(-2) },
            new() { Id = 4, TennisLevel = "Intermediate", PreferredLocation = "Other Location", CreatedAt = DateTime.UtcNow.AddDays(-3) }
        };
        var expectedDtos = new List<UserDto>
        {
            new() { Id = "2", TennisLevel = "Intermediate", PreferredLocation = "Central Park" },
            new() { Id = "3", TennisLevel = "Advanced", PreferredLocation = "Central Park" }
        };

        _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _mockUserRepository.Setup(repo => repo.GetAllUsersAsync())
            .ReturnsAsync(allUsers);
        _mockMapper.Setup(m => m.Map<List<UserDto>>(It.IsAny<List<User>>()))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetRecommendedPartnersAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }
} 