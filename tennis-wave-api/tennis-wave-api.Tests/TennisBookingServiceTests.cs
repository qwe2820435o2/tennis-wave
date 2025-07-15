// tennis-wave-api.Tests/TennisBookingServiceTests.cs
using AutoMapper;
using FluentAssertions;
using Moq;
using tennis_wave_api.Data.Interfaces;
using tennis_wave_api.Extensions;
using tennis_wave_api.Models.DTOs;
using tennis_wave_api.Models.Entities;
using tennis_wave_api.Models.Enums;
using tennis_wave_api.Services;
using tennis_wave_api.Services.Interfaces;

namespace tennis_wave_api.Tests;

/// <summary>
/// Contains unit tests for the TennisBookingService.
/// </summary>
public class TennisBookingServiceTests
{
    // Mocks for the dependencies of TennisBookingService.
    private readonly Mock<ITennisBookingRepository> _mockBookingRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    
    // The "System Under Test" - the instance of the class we are testing.
    private readonly ITennisBookingService _sut;

    public TennisBookingServiceTests()
    {
        // Initialize the mocks for each test.
        _mockBookingRepository = new Mock<ITennisBookingRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();

        // Create the instance of TennisBookingService with the mocked dependencies.
        _sut = new TennisBookingService(_mockBookingRepository.Object, _mockUserRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task GetAllBookingsAsync_ShouldReturnMappedBookings()
    {
        // Arrange
        var bookings = new List<TennisBooking>
        {
            new() { Id = 1, Title = "Morning Tennis", CreatorId = 1 },
            new() { Id = 2, Title = "Evening Tennis", CreatorId = 2 }
        };
        var expectedDtos = new List<TennisBookingDto>
        {
            new() { Id = 1, Title = "Morning Tennis", CreatorId = 1 },
            new() { Id = 2, Title = "Evening Tennis", CreatorId = 2 }
        };

        _mockBookingRepository.Setup(repo => repo.GetAllAsync())
            .ReturnsAsync(bookings);
        _mockMapper.Setup(m => m.Map<List<TennisBookingDto>>(bookings))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetAllBookingsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }

    [Fact]
    public async Task GetBookingByIdAsync_ShouldReturnBooking_WhenExists()
    {
        // Arrange
        var bookingId = 1;
        var booking = new TennisBooking { Id = bookingId, Title = "Test Booking", CreatorId = 1 };
        var expectedDto = new TennisBookingDto { Id = bookingId, Title = "Test Booking", CreatorId = 1 };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync(booking);
        _mockMapper.Setup(m => m.Map<TennisBookingDto>(booking))
            .Returns(expectedDto);

        // Act
        var result = await _sut.GetBookingByIdAsync(bookingId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
    }

    [Fact]
    public async Task GetBookingByIdAsync_ShouldReturnNull_WhenNotFound()
    {
        // Arrange
        var bookingId = 999;

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync((TennisBooking)null);

        // Act
        var result = await _sut.GetBookingByIdAsync(bookingId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetMyBookingsAsync_ShouldReturnUserBookings()
    {
        // Arrange
        var userId = 1;
        var bookings = new List<TennisBooking>
        {
            new() { Id = 1, Title = "My Booking 1", CreatorId = userId },
            new() { Id = 2, Title = "My Booking 2", CreatorId = userId }
        };
        var expectedDtos = new List<TennisBookingDto>
        {
            new() { Id = 1, Title = "My Booking 1", CreatorId = userId },
            new() { Id = 2, Title = "My Booking 2", CreatorId = userId }
        };

        _mockBookingRepository.Setup(repo => repo.GetByCreatorIdAsync(userId))
            .ReturnsAsync(bookings);
        _mockMapper.Setup(m => m.Map<List<TennisBookingDto>>(bookings))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetMyBookingsAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldReturnCreatedBooking()
    {
        // Arrange
        var userId = 1;
        var createBookingDto = new CreateBookingDto
        {
            Title = "New Tennis Session",
            Description = "Join me for tennis",
            Location = "Central Park",
            BookingTime = DateTime.UtcNow.AddDays(1),
            MaxParticipants = 4,
            Type = BookingType.Singles
        };
        var createdBooking = new TennisBooking
        {
            Id = 1,
            Title = "New Tennis Session",
            CreatorId = userId,
            Status = BookingStatus.Pending,
            CurrentParticipants = 1
        };
        var expectedDto = new TennisBookingDto
        {
            Id = 1,
            Title = "New Tennis Session",
            CreatorId = userId,
            Status = BookingStatus.Pending
        };

        _mockBookingRepository.Setup(repo => repo.CreateAsync(It.IsAny<TennisBooking>()))
            .ReturnsAsync(createdBooking);
        _mockMapper.Setup(m => m.Map<TennisBooking>(createBookingDto))
            .Returns(createdBooking);
        _mockMapper.Setup(m => m.Map<TennisBookingDto>(createdBooking))
            .Returns(expectedDto);

        // Act
        var result = await _sut.CreateBookingAsync(createBookingDto, userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
        _mockBookingRepository.Verify(repo => repo.CreateAsync(It.Is<TennisBooking>(b => 
            b.CreatorId == userId && b.Status == BookingStatus.Pending)), Times.Once);
    }

    [Fact]
    public async Task UpdateBookingAsync_ShouldReturnUpdatedBooking_WhenAuthorized()
    {
        // Arrange
        var bookingId = 1;
        var userId = 1;
        var updateBookingDto = new UpdateBookingDto
        {
            Title = "Updated Tennis Session",
            Description = "Updated description"
        };
        var existingBooking = new TennisBooking { Id = bookingId, CreatorId = userId, Title = "Old Title" };
        var updatedBooking = new TennisBooking { Id = bookingId, CreatorId = userId, Title = "Updated Tennis Session" };
        var expectedDto = new TennisBookingDto { Id = bookingId, CreatorId = userId, Title = "Updated Tennis Session" };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync(existingBooking);
        _mockBookingRepository.Setup(repo => repo.UpdateAsync(It.IsAny<TennisBooking>()))
            .ReturnsAsync(updatedBooking);
        _mockMapper.Setup(m => m.Map(updateBookingDto, existingBooking))
            .Returns(updatedBooking);
        _mockMapper.Setup(m => m.Map<TennisBookingDto>(updatedBooking))
            .Returns(expectedDto);

        // Act
        var result = await _sut.UpdateBookingAsync(bookingId, updateBookingDto, userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
    }

    [Fact]
    public async Task UpdateBookingAsync_ShouldThrowBusinessException_WhenBookingNotFound()
    {
        // Arrange
        var bookingId = 999;
        var userId = 1;
        var updateBookingDto = new UpdateBookingDto { Title = "Updated Title" };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync((TennisBooking)null);

        // Act
        Func<Task> act = async () => await _sut.UpdateBookingAsync(bookingId, updateBookingDto, userId);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("Booking not found");
    }

    [Fact]
    public async Task UpdateBookingAsync_ShouldThrowBusinessException_WhenNotAuthorized()
    {
        // Arrange
        var bookingId = 1;
        var userId = 1;
        var creatorId = 2;
        var updateBookingDto = new UpdateBookingDto { Title = "Updated Title" };
        var existingBooking = new TennisBooking { Id = bookingId, CreatorId = creatorId };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync(existingBooking);

        // Act
        Func<Task> act = async () => await _sut.UpdateBookingAsync(bookingId, updateBookingDto, userId);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("You can only update your own bookings");
    }

    [Fact]
    public async Task DeleteBookingAsync_ShouldReturnTrue_WhenAuthorized()
    {
        // Arrange
        var bookingId = 1;
        var userId = 1;
        var booking = new TennisBooking { Id = bookingId, CreatorId = userId };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync(booking);
        _mockBookingRepository.Setup(repo => repo.DeleteAsync(bookingId))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.DeleteBookingAsync(bookingId, userId);

        // Assert
        result.Should().BeTrue();
        _mockBookingRepository.Verify(repo => repo.DeleteAsync(bookingId), Times.Once);
    }

    [Fact]
    public async Task DeleteBookingAsync_ShouldReturnFalse_WhenBookingNotFound()
    {
        // Arrange
        var bookingId = 999;
        var userId = 1;

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync((TennisBooking)null);

        // Act
        var result = await _sut.DeleteBookingAsync(bookingId, userId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task JoinBookingAsync_ShouldReturnTrue_WhenSuccessful()
    {
        // Arrange
        var bookingId = 1;
        var userId = 2;
        var booking = new TennisBooking
        {
            Id = bookingId,
            CreatorId = 1,
            Status = BookingStatus.Pending,
            CurrentParticipants = 2,
            MaxParticipants = 4
        };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync(booking);
        _mockBookingRepository.Setup(repo => repo.GetParticipantAsync(bookingId, userId))
            .ReturnsAsync((BookingParticipant)null);
        _mockBookingRepository.Setup(repo => repo.AddParticipantAsync(It.IsAny<BookingParticipant>()))
            .ReturnsAsync(new BookingParticipant { BookingId = bookingId, UserId = userId });
        _mockBookingRepository.Setup(repo => repo.UpdateAsync(It.IsAny<TennisBooking>()))
            .ReturnsAsync(booking);

        // Act
        var result = await _sut.JoinBookingAsync(bookingId, userId);

        // Assert
        result.Should().BeTrue();
        _mockBookingRepository.Verify(repo => repo.AddParticipantAsync(It.IsAny<BookingParticipant>()), Times.Once);
    }

    [Fact]
    public async Task JoinBookingAsync_ShouldThrowBusinessException_WhenJoiningOwnBooking()
    {
        // Arrange
        var bookingId = 1;
        var userId = 1;
        var booking = new TennisBooking { Id = bookingId, CreatorId = userId };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync(booking);

        // Act
        Func<Task> act = async () => await _sut.JoinBookingAsync(bookingId, userId);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("You cannot join your own booking");
    }

    [Fact]
    public async Task JoinBookingAsync_ShouldThrowBusinessException_WhenBookingFull()
    {
        // Arrange
        var bookingId = 1;
        var userId = 2;
        var booking = new TennisBooking
        {
            Id = bookingId,
            CreatorId = 1,
            Status = BookingStatus.Pending,
            CurrentParticipants = 4,
            MaxParticipants = 4
        };

        _mockBookingRepository.Setup(repo => repo.GetByIdAsync(bookingId))
            .ReturnsAsync(booking);

        // Act
        Func<Task> act = async () => await _sut.JoinBookingAsync(bookingId, userId);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("Booking is full");
    }

    [Fact]
    public async Task GetBookingsByStatusAsync_ShouldReturnFilteredBookings()
    {
        // Arrange
        var status = BookingStatus.Pending;
        var bookings = new List<TennisBooking>
        {
            new() { Id = 1, Status = BookingStatus.Pending },
            new() { Id = 2, Status = BookingStatus.Pending }
        };
        var expectedDtos = new List<TennisBookingDto>
        {
            new() { Id = 1, Status = BookingStatus.Pending },
            new() { Id = 2, Status = BookingStatus.Pending }
        };

        _mockBookingRepository.Setup(repo => repo.GetByStatusAsync(status))
            .ReturnsAsync(bookings);
        _mockMapper.Setup(m => m.Map<List<TennisBookingDto>>(bookings))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetBookingsByStatusAsync(status);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }

    [Fact]
    public async Task GetBookingsByLocationAsync_ShouldReturnLocationFilteredBookings()
    {
        // Arrange
        var location = "Central Park";
        var bookings = new List<TennisBooking>
        {
            new() { Id = 1, Location = "Central Park" },
            new() { Id = 2, Location = "Central Park" }
        };
        var expectedDtos = new List<TennisBookingDto>
        {
            new() { Id = 1, Location = "Central Park" },
            new() { Id = 2, Location = "Central Park" }
        };

        _mockBookingRepository.Setup(repo => repo.GetByLocationAsync(location))
            .ReturnsAsync(bookings);
        _mockMapper.Setup(m => m.Map<List<TennisBookingDto>>(bookings))
            .Returns(expectedDtos);

        // Act
        var result = await _sut.GetBookingsByLocationAsync(location);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedDtos);
    }
} 