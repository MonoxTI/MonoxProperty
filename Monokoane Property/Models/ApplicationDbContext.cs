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
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PropertyReport> PropertyReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Lease>()
        .HasQueryFilter(l => l.IsActive);

            modelBuilder.Entity<Property>()
        .HasMany(p => p.Leases)
        .WithOne(l => l.Property)
        .HasForeignKey(l => l.PropertyId)
        .OnDelete(DeleteBehavior.Cascade);

        // Self-referencing parent-child for apartment units
modelBuilder.Entity<Property>()
    .HasMany(p => p.UnitsList)
    .WithOne(p => p.Parent)
    .HasForeignKey(p => p.ParentId)
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
        
        // User relationships
    modelBuilder.Entity<User>()
        .HasIndex(u => u.Email)
        .IsUnique();

    modelBuilder.Entity<RefreshToken>()
        .HasOne(rt => rt.User)
        .WithMany(u => u.RefreshTokens)
        .HasForeignKey(rt => rt.UserId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Payment>()
        .HasOne(p => p.Lease)
        .WithMany(l => l.Payments)
        .HasForeignKey(p => p.LeaseId)
        .OnDelete(DeleteBehavior.Restrict);
    }
    }
}