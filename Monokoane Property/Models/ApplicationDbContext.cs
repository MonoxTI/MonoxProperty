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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 🔗 Expense → Property (many-to-one)
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasOne(e => e.Property)
                      .WithMany(p => p.Expenses)
                      .HasForeignKey(e => e.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 🔗 Lease → Property (many-to-one)
            modelBuilder.Entity<Lease>(entity =>
            {
                entity.HasOne(l => l.Property)
                      .WithMany(p => p.Leases)
                      .HasForeignKey(l => l.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 🔗 Lease → Tenant (many-to-one)
            modelBuilder.Entity<Lease>(entity =>
            {
                entity.HasOne(l => l.Tenant)
                      .WithMany(t => t.Leases)
                      .HasForeignKey(l => l.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 🔗 Optional: Enforce uniqueness
            modelBuilder.Entity<Tenant>()
                .HasIndex(t => t.Email)
                .IsUnique();

            modelBuilder.Entity<Property>()
                .HasIndex(p => p.PropertyName)
                .IsUnique();
        }
    }
}