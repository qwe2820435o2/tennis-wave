using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using tennis_wave_api.Models.Enums;

namespace tennis_wave_api.Models.Entities;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<User> Users { get; set; }

    // Tennis Booking entities
    public virtual DbSet<TennisBooking> TennisBookings { get; set; }
    public virtual DbSet<BookingParticipant> BookingParticipants { get; set; }
    public virtual DbSet<BookingRequest> BookingRequests { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Conversa__3214EC075535A963");

            entity.HasIndex(e => e.LastMessageAt, "IX_Conversations_LastMessageAt");

            entity.HasIndex(e => e.User1Id, "IX_Conversations_User1Id");

            entity.HasIndex(e => e.User2Id, "IX_Conversations_User2Id");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");

            entity.HasOne(d => d.User1).WithMany(p => p.ConversationUser1s)
                .HasForeignKey(d => d.User1Id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Conversations_User1");

            entity.HasOne(d => d.User2).WithMany(p => p.ConversationUser2s)
                .HasForeignKey(d => d.User2Id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Conversations_User2");
        });



        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Messages__3214EC075CD6CB2B");

            entity.HasIndex(e => e.ConversationId, "IX_Messages_ConversationId");

            entity.HasIndex(e => new { e.ConversationId, e.CreatedAt }, "IX_Messages_ConversationId_CreatedAt");

            entity.HasIndex(e => e.CreatedAt, "IX_Messages_CreatedAt");

            entity.HasIndex(e => e.SenderId, "IX_Messages_SenderId");

            entity.Property(e => e.Content).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasOne(d => d.Conversation).WithMany(p => p.Messages)
                .HasForeignKey(d => d.ConversationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Messages_Conversation");

            entity.HasOne(d => d.Sender).WithMany(p => p.Messages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Messages_Sender");
        });



        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC071B0907CE");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105341DE57479").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.PreferredLocation).HasMaxLength(200);
            entity.Property(e => e.TennisLevel).HasMaxLength(50);
            entity.Property(e => e.UserName).HasMaxLength(100);
        });

        // Tennis Booking entity configurations
        modelBuilder.Entity<TennisBooking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TennisBo__3214EC0730F848ED");

            entity.HasIndex(e => e.CreatorId, "IX_TennisBookings_CreatorId");
            entity.HasIndex(e => e.BookingTime, "IX_TennisBookings_BookingTime");
            entity.HasIndex(e => e.Status, "IX_TennisBookings_Status");
            entity.HasIndex(e => e.Type, "IX_TennisBookings_Type");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.CurrentParticipants).HasDefaultValue(1);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.MaxParticipants).HasDefaultValue(2);
            entity.Property(e => e.Status).HasDefaultValue(BookingStatus.Pending);
            entity.Property(e => e.Type).HasDefaultValue(BookingType.Casual);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.ContactInfo).HasMaxLength(500);
            entity.Property(e => e.AdditionalNotes).HasMaxLength(1000);
            entity.Property(e => e.PreferredTimeSlots).HasMaxLength(500);

            entity.HasOne(d => d.Creator).WithMany()
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TennisBookings_Creator");
        });

        modelBuilder.Entity<BookingParticipant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BookingP__3214EC0738996AB5");

            entity.HasIndex(e => e.BookingId, "IX_BookingParticipants_BookingId");
            entity.HasIndex(e => e.UserId, "IX_BookingParticipants_UserId");
            entity.HasIndex(e => new { e.BookingId, e.UserId }, "IX_BookingParticipants_BookingId_UserId").IsUnique();

            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Status).HasDefaultValue(ParticipantStatus.Pending);

            entity.HasOne(d => d.Booking).WithMany(p => p.Participants)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BookingParticipants_Booking");

            entity.HasOne(d => d.User).WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BookingParticipants_User");
        });

        modelBuilder.Entity<BookingRequest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BookingR__3214EC075CD6CB2B");

            entity.HasIndex(e => e.BookingId, "IX_BookingRequests_BookingId");
            entity.HasIndex(e => e.RequesterId, "IX_BookingRequests_RequesterId");
            entity.HasIndex(e => new { e.BookingId, e.RequesterId }, "IX_BookingRequests_BookingId_RequesterId").IsUnique();

            entity.Property(e => e.RequestedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Status).HasDefaultValue(RequestStatus.Pending);
            entity.Property(e => e.Message).HasMaxLength(1000);
            entity.Property(e => e.ResponseMessage).HasMaxLength(1000);

            entity.HasOne(d => d.Booking).WithMany(p => p.Requests)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BookingRequests_Booking");

            entity.HasOne(d => d.Requester).WithMany()
                .HasForeignKey(d => d.RequesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BookingRequests_Requester");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
