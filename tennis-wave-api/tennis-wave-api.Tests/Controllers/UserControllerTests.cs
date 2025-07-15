// tennis-wave-api.Tests/Controllers/UserControllerTests.cs

using AutoMapper;
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
/// Contains unit tests for the UserController.
/// </summary>
public class UserControllerTests
{
    // Mocks for the dependencies of UserController.
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<IMapper> _mockMapper;
    
    // The "System Under Test" - the instance of the class we are testing.
    private readonly UserController _sut;

    public UserControllerTests()
    {
        // Initialize the mocks for each test.
        _mockUserService = new Mock<IUserService>();
        _mockMapper = new Mock<IMapper>();

        // Create the instance of UserController with the mocked dependencies.
        _sut = new UserController(_mockUserService.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task GetAllUsers_ShouldReturnOkResult_WithUsers()
    {
        // Arrange
        var users = new List<UserDto>
        {
            new() { Id = "1", UserName = "user1", Email = "user1@test.com" },
            new() { Id = "2", UserName = "user2", Email = "user2@test.com" }
        };

        _mockUserService.Setup(service => service.GetAllUsersAsync())
            .ReturnsAsync(users);

        // Act
        var result = await _sut.GetAllUsers();

        // Assert
        result.Should().BeOfType<ActionResult<IEnumerable<UserDto>>>();
        var actionResult = result as ActionResult<IEnumerable<UserDto>>;
        actionResult!.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetUserById_ShouldReturnOkResult_WhenUserExists()
    {
        // Arrange
        var userId = 1;
        var user = new UserDto
        {
            Id = userId.ToString(),
            UserName = "testuser",
            Email = "test@test.com"
        };

        _mockUserService.Setup(service => service.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.GetUserById(userId);

        // Assert
        result.Should().BeOfType<ActionResult<UserDto>>();
        var actionResult = result as ActionResult<UserDto>;
        actionResult!.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetUserById_ShouldReturnNotFound_WhenUserNotFound()
    {
        // Arrange
        var userId = 999;

        _mockUserService.Setup(service => service.GetUserByIdAsync(userId))
            .ThrowsAsync(new KeyNotFoundException($"User {userId} is not exist"));

        // Act
        var result = await _sut.GetUserById(userId);

        // Assert
        result.Should().BeOfType<ActionResult<UserDto>>();
        var actionResult = result as ActionResult<UserDto>;
        actionResult!.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateUser_ShouldReturnOkResult_WhenUpdateSuccessful()
    {
        // Arrange
        var userId = 1;
        var updateUserDto = new UpdateUserDto
        {
            UserName = "newuser",
            Bio = "New bio"
        };
        var updatedUser = new UserDto
        {
            Id = userId.ToString(),
            UserName = "newuser",
            Bio = "New bio"
        };

        _mockUserService.Setup(service => service.UpdateUserAsync(userId, updateUserDto))
            .ReturnsAsync(updatedUser);

        // Act
        var result = await _sut.UpdateUser(userId, updateUserDto);

        // Assert
        result.Should().BeOfType<ActionResult<UserDto>>();
        var actionResult = result as ActionResult<UserDto>;
        actionResult!.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task DeleteUser_ShouldReturnOkResult_WhenDeleteSuccessful()
    {
        // Arrange
        var userId = 1;

        _mockUserService.Setup(service => service.DeleteUserAsync(userId))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _sut.DeleteUser(userId);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task SearchUsers_ShouldReturnOkResult_WithSearchResults()
    {
        // Arrange
        var query = "test";
        var searchResults = new List<UserSearchDto>
        {
            new() { UserId = 2, Keyword = "testuser1" },
            new() { UserId = 3, Keyword = "testuser2" }
        };

        _mockUserService.Setup(service => service.SearchUsersAsync(query, It.IsAny<int>()))
            .ReturnsAsync(searchResults);

        // Act
        var result = await _sut.SearchUsers(query);

        // Assert
        result.Should().BeOfType<ActionResult<ApiResponse<List<UserSearchDto>>>>();
    }

    [Fact]
    public async Task GetUsersWithPagination_ShouldReturnOkResult_WithPaginatedData()
    {
        // Arrange
        var page = 1;
        var pageSize = 10;
        var paginatedResult = new UserSearchResultDto
        {
            Items = new List<UserDto>
            {
                new() { Id = "1", UserName = "user1" },
                new() { Id = "2", UserName = "user2" }
            },
            TotalCount = 2,
            Page = 1,
            PageSize = 10,
            TotalPages = 1,
            HasNextPage = false,
            HasPreviousPage = false
        };

        _mockUserService.Setup(service => service.GetUsersWithPaginationAsync(page, pageSize, null, false))
            .ReturnsAsync(paginatedResult);

        // Act
        var result = await _sut.GetUsersWithPagination(page, pageSize);

        // Assert
        result.Should().BeOfType<ActionResult<ApiResponse<UserSearchResultDto>>>();
        var actionResult = result as ActionResult<ApiResponse<UserSearchResultDto>>;
        actionResult!.Result.Should().BeOfType<OkObjectResult>();
    }


    [Fact]
    public async Task ChangePassword_ShouldReturnOkResult_WhenPasswordChanged()
    {
        // Arrange
        var userId = 1;
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "oldpassword",
            NewPassword = "newpassword"
        };

        _mockUserService.Setup(service => service.ChangePasswordAsync(userId, changePasswordDto))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.ChangePassword(userId, changePasswordDto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var apiResponse = okResult!.Value as ApiResponse<object>;
        apiResponse.Should().NotBeNull();
        apiResponse!.Message.Should().Be("Password changed successfully");
    }

    [Fact]
    public async Task ChangePassword_ShouldReturnBadRequest_WhenCurrentPasswordIncorrect()
    {
        // Arrange
        var userId = 1;
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "wrongpassword",
            NewPassword = "newpassword"
        };

        _mockUserService.Setup(service => service.ChangePasswordAsync(userId, changePasswordDto))
            .ThrowsAsync(new BusinessException("Current password is incorrect", "INVALID_PASSWORD"));

        // Act
        var result = await _sut.ChangePassword(userId, changePasswordDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task CheckEmailUnique_ShouldReturnOkResult_WhenEmailIsUnique()
    {
        // Arrange
        var email = "unique@test.com";

        _mockUserService.Setup(service => service.IsEmailUniqueAsync(email, null))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.CheckEmailUnique(email);

        // Assert
        result.Should().BeOfType<ActionResult<bool>>();
        var actionResult = result as ActionResult<bool>;
        actionResult!.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task CheckUsernameUnique_ShouldReturnOkResult_WhenUserNameIsUnique()
    {
        // Arrange
        var userName = "uniqueuser";

        _mockUserService.Setup(service => service.IsUserNameUniqueAsync(userName, null))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.CheckUsernameUnique(userName);

        // Assert
        result.Should().BeOfType<ActionResult<bool>>();
        var actionResult = result as ActionResult<bool>;
        actionResult!.Result.Should().BeOfType<OkObjectResult>();
    }
} 