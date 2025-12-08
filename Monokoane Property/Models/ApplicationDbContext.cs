using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using MonoxProperty.Entities;

namespace MonoxProperty
{
    public class ApplicationDB : DbContext
    {
        public ApplicationDB(DbContextOptions<ApplicationDB> options) : base(options) { }

        public DbSet<Property> Properties { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Lease> Leases { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Property>()
        .HasMany(p => p.Leases)
        .WithOne(l => l.Property)
        .HasForeignKey(l => l.PropertyId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<Property>()
        .HasMany(p => p.Expenses)
        .WithOne(e => e.Property)
        .HasForeignKey(e => e.PropertyId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<Tenant>()
        .HasMany(t => t.Leases)
        .WithOne(l => l.Tenant)
        .HasForeignKey(l => l.TenantId)
        .OnDelete(DeleteBehavior.Cascade);
        }
    }
}