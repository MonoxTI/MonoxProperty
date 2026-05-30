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

                var expiredLeases = await context.Leases
                    .Where(l => l.End < DateTime.UtcNow && l.IsActive)
                    .ToListAsync(stoppingToken);

                if (expiredLeases.Any())
                {
                    foreach (var lease in expiredLeases)
                    {
                        lease.IsActive = false;
                        lease.DeactivatedAt = DateTime.UtcNow;
                    }

                    await context.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Deactivated {count} expired leases", expiredLeases.Count);
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