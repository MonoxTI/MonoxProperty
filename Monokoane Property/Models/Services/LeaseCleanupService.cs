using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using MonoxProperty;

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
                using (var scope = _scopeFactory.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDB>();

                    var expiredLeases = await context.Leases
                    .Where(l => l.End < DateTime.UtcNow && l.IsActive)
                    .ToListAsync(stoppingToken);
                    
                    foreach (var lease in expiredLeases)
                    {
                        lease.IsActive = false;
                        lease.DeactivatedAt = DateTime.UtcNow;
                    }

await context.SaveChangesAsync(stoppingToken);

                    if (expiredLeases.Any())
                    {
                        context.Leases.RemoveRange(expiredLeases);
                        await context.SaveChangesAsync(stoppingToken);

                        _logger.LogInformation("Deleted {count} expired leases", expiredLeases.Count);
                    }
                    else
                    {
                        _logger.LogInformation("No expired leases found");
                    }
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