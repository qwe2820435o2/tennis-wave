// tennis-wave-api.Tests/AuthServiceTests.cs
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Services;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Tests;

/// <summary>
/// Contains unit tests for the AuthService.
/// </summary>
public class AuthServiceTests
{
    // Mocks for the dependencies of AuthService.
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly IOptions<JwtSettings> _jwtSettings;
    
    // The "System Under Test" - the instance of the class we are testing.
    private readonly IAuthService _sut;

    public AuthServiceTests()
    {
        // Initialize the mocks for each test.
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();
        
        // Create a real instance of JwtSettings for testing.
        _jwtSettings = Options.Create(new JwtSettings
        {
            SecretKey = "a_very_long_and_secure_secret_key_for_unit_testing",
            Issuer = "test-issuer",
            Audience = "test-audience",
            ExpiryInMinutes = 60
        });

        // Create the instance of AuthService with the mocked dependencies.
        _sut = new AuthService(_mockUserRepository.Object, _jwtSettings, _mockMapper.Object);
    }

    // A good test name describes the method, the scenario, and the expected outcome.
    [Fact]
    public async Task RegisterAsync_ShouldThrowBusinessException_WhenEmailAlreadyExists()
    {
        // Arrange: Prepare the scenario for the test.
        var registerDto = new RegisterDto { Email = "test@example.com", Password = "password", UserName = "testuser" };
        
        // Configure the mock repository to simulate finding an existing user with this email.
        _mockUserRepository.Setup(repo => repo.GetByEmailAsync(registerDto.Email))
            .ReturnsAsync(new User()); // Return a non-null user to indicate it exists.

        // Act: Execute the method being tested.
        // We wrap the call in a Func<Task> to test for an exception.
        Func<Task> act = async () => await _sut.RegisterAsync(registerDto);

        // Assert: Verify the outcome.
        // We expect a BusinessException to be thrown.
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("Email is already taken.");
    }

    [Fact]
    public async Task RegisterAsync_ShouldReturnAuthResponse_WhenRegistrationIsSuccessful()
    {
        // Arrange
        var registerDto = new RegisterDto { Email = "new@example.com", Password = "password", UserName = "newuser" };
        var createdUser = new User { Id = 1, Email = registerDto.Email, UserName = registerDto.UserName };
        var expectedResponse = new AuthResponseDto { UserId = 1, Email = registerDto.Email, UserName = registerDto.UserName };

        // Simulate that the email is not taken.
        _mockUserRepository.Setup(repo => repo.GetByEmailAsync(registerDto.Email))
            .ReturnsAsync((User)null); // Return null.
        
        // Simulate the user creation.
        _mockUserRepository.Setup(repo => repo.CreateUserAsync(It.IsAny<User>()))
            .ReturnsAsync(createdUser);
            
        // Simulate the AutoMapper mapping.
        _mockMapper.Setup(m => m.Map<AuthResponseDto>(createdUser))
            .Returns(expectedResponse);

        // Act
        var result = await _sut.RegisterAsync(registerDto);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedResponse, options => options.Excluding(r => r.Token)); // Compare properties, ignore token for now.
        result.Token.Should().NotBeNullOrEmpty(); // Ensure a token was generated.
    }
    
    [Fact]
    public async Task LoginAsync_ShouldThrowBusinessException_WhenCredentialsAreInvalid()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "user@example.com", Password = "wrong_password" };

        // Simulate a user not being found, or password not matching.
        // For this test, we can just simulate the user not being found.
        _mockUserRepository.Setup(repo => repo.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync((User)null);

        // Act
        Func<Task> act = async () => await _sut.LoginAsync(loginDto);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("Invalid credentials.");
    }
    
    [Fact]
    public async Task LoginAsync_ShouldReturnAuthResponse_WhenLoginIsSuccessful()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "user@example.com", Password = "correct_password" };
        // IMPORTANT: The hash must be generated from the password we are testing against.
        var userHash = BCrypt.Net.BCrypt.HashPassword(loginDto.Password);
        var existingUser = new User { Id = 2, Email = loginDto.Email, UserName = "existinguser", PasswordHash = userHash };
        var expectedResponse = new AuthResponseDto { UserId = 2, Email = loginDto.Email, UserName = "existinguser" };

        _mockUserRepository.Setup(repo => repo.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync(existingUser);
            
        _mockMapper.Setup(m => m.Map<AuthResponseDto>(existingUser))
            .Returns(expectedResponse);

        // Act
        var result = await _sut.LoginAsync(loginDto);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedResponse, options => options.Excluding(r => r.Token));
        result.Token.Should().NotBeNullOrEmpty();
    }
}