using Microsoft.EntityFrameworkCore;

namespace tennis_wave_api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
} 