using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

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

    public virtual DbSet<MatchParticipant> MatchParticipants { get; set; }

    public virtual DbSet<TennisMatch> TennisMatches { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=TRAVIS\\SQLEXPRESS;Database=TennisWave;User Id=sa;Password=Qwe110p23.;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MatchParticipant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MatchPar__3214EC0738996AB5");

            entity.HasIndex(e => e.MatchId, "IX_MatchParticipants_MatchId");

            entity.HasIndex(e => new { e.MatchId, e.UserId }, "IX_MatchParticipants_MatchId_UserId").IsUnique();

            entity.HasIndex(e => e.UserId, "IX_MatchParticipants_UserId");

            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValue("Participant");
        });

        modelBuilder.Entity<TennisMatch>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TennisMa__3214EC0730F848ED");

            entity.HasIndex(e => e.CreatorId, "IX_TennisMatches_CreatorId");

            entity.HasIndex(e => e.MatchTime, "IX_TennisMatches_MatchTime");

            entity.HasIndex(e => e.Status, "IX_TennisMatches_Status");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.CurrentParticipants).HasDefaultValue(1);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.MatchType).HasMaxLength(50);
            entity.Property(e => e.MaxParticipants).HasDefaultValue(2);
            entity.Property(e => e.SkillLevel).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Open");
            entity.Property(e => e.Title).HasMaxLength(200);
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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
