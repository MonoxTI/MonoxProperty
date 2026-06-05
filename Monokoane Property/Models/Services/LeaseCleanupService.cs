using MonoxProperty;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public class LeaseCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LeaseCleanupService> _logger;

    public LeaseCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<LeaseCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Lease Cleanup Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDB>();

                // Find all active leases that have expired
                var expiredLeases = await context.Leases
                    .Where(l => l.End < DateTime.UtcNow && l.IsActive)
                    .ToListAsync(stoppingToken);

                if (expiredLeases.Any())
                {
                    // Collect unique property names linked to expired leases
                    var propertyIds = expiredLeases
                        .Select(l => l.PropertyId)
                        .Distinct()
                        .ToList();

                    // Get the property names for those IDs
                    var propertyNames = await context.Properties
                        .Where(p => propertyIds.Contains(p.Id))
                        .Select(p => p.PropertyName)
                        .ToListAsync(stoppingToken);

                    // Delete PropertyReport entries for those properties
                    var reportsToDelete = await context.PropertyReports
                        .Where(r => propertyNames.Contains(r.PropertyName))
                        .ToListAsync(stoppingToken);

                    if (reportsToDelete.Any())
                    {
                        context.PropertyReports.RemoveRange(reportsToDelete);
                        _logger.LogInformation(
                            "Deleted {count} property reports for expired leases",
                            reportsToDelete.Count);
                    }

                    // Deactivate the expired leases
                    foreach (var lease in expiredLeases)
                    {
                        lease.IsActive = false;
                        lease.DeactivatedAt = DateTime.UtcNow;
                    }

                    await context.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation(
                        "Deactivated {count} expired leases",
                        expiredLeases.Count);
                }
                else
                {
                    _logger.LogInformation("No expired leases found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during lease cleanup");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}