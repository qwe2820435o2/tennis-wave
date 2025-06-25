using AutoMapper;
using FluentAssertions;
using Moq;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Services;

namespace tennis_wave_api.Tests;

public class UserProfileServiceTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly IMapper _mapper;
    private readonly UserService _userService;

    public UserProfileServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        
        // Set up AutoMapper
        var mapperConfig = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });
        _mapper = mapperConfig.CreateMapper();
        
        _userService = new UserService(_mockUserRepository.Object, _mapper);
    }
    
    [Fact]
    public async Task GetUserProfileAsync_WithValidUserId_ShouldReturnUserProfile()
    {
        // Arrange
        var userId = 1;
        var user = new User
        {
            Id = userId,
            UserName = "testuser",
            Email = "test@example.com",
            Avatar = "avatar.jpg",
            TennisLevel = "Intermediate",
            PreferredLocation = "Central Park",
            Bio = "I love tennis!",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _userService.GetUserProfileAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(userId);
        result.UserName.Should().Be("testuser");
        result.Email.Should().Be("test@example.com");
        result.Avatar.Should().Be("avatar.jpg");
        result.TennisLevel.Should().Be("Intermediate");
        result.PreferredLocation.Should().Be("Central Park");
        result.Bio.Should().Be("I love tennis!");
    }

    [Fact]
    public async Task GetUserProfileAsync_WithInvalidUserId_ShouldThrowException()
    {
        // Arrange
        var userId = 999;
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
            .ThrowsAsync(new KeyNotFoundException($"User with ID {userId} not found"));

        // Act & Assert
        await Assert.ThrowsAsync<BusinessException>(() => 
            _userService.GetUserProfileAsync(userId));
    }

    [Fact]
    public async Task UpdateUserProfileAsync_WithValidData_ShouldUpdateProfile()
    {
        // Arrange
        var userId = 1;
        var existingUser = new User
        {
            Id = userId,
            UserName = "olduser",
            Email = "test@example.com",
            TennisLevel = "Beginner"
        };

        var updateDto = new UpdateUserProfileDto
        {
            UserName = "newuser",
            Bio = "Updated bio",
            TennisLevel = "Advanced",
            PreferredLocation = "Tennis Club"
        };

        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(x => x.IsUserNameUniqueAsync("newuser", userId))
            .ReturnsAsync(true);
        _mockUserRepository.Setup(x => x.UpdateUserAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => u);

        // Act
        var result = await _userService.UpdateUserProfileAsync(userId, updateDto);

        // Assert
        result.Should().NotBeNull();
        result.UserName.Should().Be("newuser");
        result.Bio.Should().Be("Updated bio");
        result.TennisLevel.Should().Be("Advanced");
        result.PreferredLocation.Should().Be("Tennis Club");
    }

    [Fact]
    public async Task UpdateUserProfileAsync_WithDuplicateUsername_ShouldThrowException()
    {
        // Arrange
        var userId = 1;
        var existingUser = new User
        {
            Id = userId,
            UserName = "olduser",
            Email = "test@example.com"
        };

        var updateDto = new UpdateUserProfileDto
        {
            UserName = "existinguser"
        };

        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(x => x.IsUserNameUniqueAsync("existinguser", userId))
            .ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessException>(() => 
            _userService.UpdateUserProfileAsync(userId, updateDto));
    }

    [Fact]
    public async Task ChangePasswordAsync_WithValidCurrentPassword_ShouldChangePassword()
    {
        // Arrange
        var userId = 1;
        var currentPassword = "oldpassword";
        var currentPasswordHash = BCrypt.Net.BCrypt.HashPassword(currentPassword);
        var user = new User
        {
            Id = userId,
            PasswordHash = currentPasswordHash
        };

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = currentPassword, // 使用相同的密码
            NewPassword = "newpassword",
            ConfirmPassword = "newpassword"
        };

        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _mockUserRepository.Setup(x => x.UpdateUserAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => u);

        // Act
        var result = await _userService.ChangePasswordAsync(userId, changePasswordDto);

        // Assert
        result.Should().BeTrue();
        _mockUserRepository.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task ChangePasswordAsync_WithInvalidCurrentPassword_ShouldThrowException()
    {
        // Arrange
        var userId = 1;
        var correctPassword = "correctpassword";
        var correctPasswordHash = BCrypt.Net.BCrypt.HashPassword(correctPassword);
        var user = new User
        {
            Id = userId,
            PasswordHash = correctPasswordHash
        };

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "wrongpassword", // 使用错误的密码
            NewPassword = "newpassword",
            ConfirmPassword = "newpassword"
        };

        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessException>(() => 
            _userService.ChangePasswordAsync(userId, changePasswordDto));
    }

    [Fact]
    public async Task IsEmailUniqueAsync_WithUniqueEmail_ShouldReturnTrue()
    {
        // Arrange
        var email = "unique@example.com";
        _mockUserRepository.Setup(x => x.IsEmailUniqueAsync(email, null))
            .ReturnsAsync(true);

        // Act
        var result = await _userService.IsEmailUniqueAsync(email);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsUserNameUniqueAsync_WithUniqueUsername_ShouldReturnTrue()
    {
        // Arrange
        var userName = "uniqueuser";
        _mockUserRepository.Setup(x => x.IsUserNameUniqueAsync(userName, null))
            .ReturnsAsync(true);

        // Act
        var result = await _userService.IsUserNameUniqueAsync(userName);

        // Assert
        result.Should().BeTrue();
    }
}