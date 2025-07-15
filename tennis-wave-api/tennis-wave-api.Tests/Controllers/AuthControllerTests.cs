// tennis-wave-api.Tests/Controllers/AuthControllerTests.cs
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using tennis_wave_api.Controllers;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Tests.Controllers;

/// <summary>
/// Contains unit tests for the AuthController.
/// </summary>
public class AuthControllerTests
{
    // Mocks for the dependencies of AuthController.
    private readonly Mock<IAuthService> _mockAuthService;
    
    // The "System Under Test" - the instance of the class we are testing.
    private readonly AuthController _sut;

    public AuthControllerTests()
    {
        // Initialize the mocks for each test.
        _mockAuthService = new Mock<IAuthService>();

        // Create the instance of AuthController with the mocked dependencies.
        _sut = new AuthController(_mockAuthService.Object);
    }

    [Fact]
    public async Task Register_ShouldReturnOkResult_WhenRegistrationSuccessful()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            UserName = "testuser",
            Email = "test@test.com",
            Password = "password123"
        };
        var expectedResponse = new AuthResponseDto
        {
            UserId = 1,
            UserName = "testuser",
            Email = "test@test.com",
            Token = "jwt_token_here"
        };

        _mockAuthService.Setup(service => service.RegisterAsync(registerDto))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _sut.Register(registerDto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var apiResponse = okResult!.Value as ApiResponse<AuthResponseDto>;
        apiResponse.Should().NotBeNull();
        apiResponse!.Data.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenBusinessExceptionThrown()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            UserName = "testuser",
            Email = "existing@test.com",
            Password = "password123"
        };

        _mockAuthService.Setup(service => service.RegisterAsync(registerDto))
            .ThrowsAsync(new BusinessException("Email is already taken.", "EMAIL_EXISTS"));

        // Act
        var result = await _sut.Register(registerDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequestResult = result as BadRequestObjectResult;
        var apiResponse = badRequestResult!.Value as ApiResponse<AuthResponseDto>;
        apiResponse.Should().NotBeNull();
        apiResponse!.Message.Should().Be("Email is already taken.");
    }

    [Fact]
    public async Task Login_ShouldReturnOkResult_WhenLoginSuccessful()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@test.com",
            Password = "password123"
        };
        var expectedResponse = new AuthResponseDto
        {
            UserId = 1,
            UserName = "testuser",
            Email = "test@test.com",
            Token = "jwt_token_here"
        };

        _mockAuthService.Setup(service => service.LoginAsync(loginDto))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _sut.Login(loginDto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var apiResponse = okResult!.Value as ApiResponse<AuthResponseDto>;
        apiResponse.Should().NotBeNull();
        apiResponse!.Data.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task Login_ShouldReturnBadRequest_WhenInvalidCredentials()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@test.com",
            Password = "wrongpassword"
        };

        _mockAuthService.Setup(service => service.LoginAsync(loginDto))
            .ThrowsAsync(new BusinessException("Invalid credentials.", "INVALID_CREDENTIALS"));

        // Act
        var result = await _sut.Login(loginDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequestResult = result as BadRequestObjectResult;
        var apiResponse = badRequestResult!.Value as ApiResponse<AuthResponseDto>;
        apiResponse.Should().NotBeNull();
        apiResponse!.Message.Should().Be("Invalid credentials.");
    }
} 