using Microsoft.EntityFrameworkCore;
using MonoxProperty.Dtos;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;

namespace MonoxProperty.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDB _db;

        public PaymentService(ApplicationDB db)
        {
            _db = db;
        }

        public async Task RecordPaymentAsync(int leaseId, PaymentType type, decimal amount)
        {
            var leaseExists = await _db.Leases.AnyAsync(l => l.Id == leaseId);
            if (!leaseExists)
            {
                throw new ArgumentException($"Lease with ID {leaseId} does not exist.");
            }
            
            var payment = new Payment
            {
                LeaseId = leaseId,
                Type = type,
                Amount = amount,
                PaymentDate = DateTime.UtcNow
            };
            
            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();
            
        }

        public async Task<PropertyReportDto?> GetMonthlySummary(string propertyName)
        {
            if (string.IsNullOrWhiteSpace(propertyName))
            return null;
            
            var now = DateTime.UtcNow;
            var startDate = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);
            
            var report = await _db.Leases
            .Include(l => l.Tenant)
            .Include(l => l.Payments)
            .Include(l => l.Property)
            .ThenInclude(p => p.Expenses)
            .Where(l => l.Property.PropertyName == propertyName)
            .Select(l => new PropertyReportDto
            {
                PropertyName = l.Property.PropertyName,
                TenantName = l.Tenant != null ? l.Tenant.FullName : "No Tenant",
                Rent = l.Payments
                .Where(p => p.Type == PaymentType.Rent &&
                            p.PaymentDate >= startDate &&
                            p.PaymentDate < endDate)
                .Sum(p => p.Amount),
                Expenses = l.Property.Expenses
                .Where(e => e.DateIncurred >= startDate &&
                            e.DateIncurred < endDate)
                .Sum(e => e.Amount),
                Profit = l.Payments
                .Where(p => p.Type == PaymentType.Rent &&
                            p.PaymentDate >= startDate &&
                            p.PaymentDate < endDate)
                .Sum(p => p.Amount)
                - l.Property.Expenses
                    .Where(e => e.DateIncurred >= startDate &&
                                e.DateIncurred < endDate)
                    .Sum(e => e.Amount)
        })
        .FirstOrDefaultAsync();
        
        return report;
        }

       // PaymentService.cs
public async Task<SummaryDto> GetMonthlySummaryAsync(int year, int month)
{
    if (year < 1 || year > 9999 || month < 1 || month > 12)
        throw new ArgumentOutOfRangeException(nameof(month), "Year and month must be valid.");
    
    var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
    var endDate = startDate.AddMonths(1);
    
    var rentTotal = await _db.Payments
        .Where(p => p.Type == PaymentType.Rent &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
        .SumAsync(p => p.Amount);

    var levyTotal = await _db.Payments
        .Where(p => p.Type == PaymentType.Levy &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
        .SumAsync(p => p.Amount);

    var bondTotal = await _db.Payments
        .Where(p => p.Type == PaymentType.Bond &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
        .SumAsync(p => p.Amount);

    var totalExpenses = await _db.Expenses
        .Where(e => e.DateIncurred >= startDate &&
                    e.DateIncurred < endDate)
        .SumAsync(e => e.Amount);

    // Calculate derived values
    var totalIncome = rentTotal + levyTotal;
    var profit = totalIncome - (bondTotal + totalExpenses);

    // Return complete DTO with all properties set
    return new SummaryDto
    {
        Year = year,
        Month = month,
        TotalRent = rentTotal,
        TotalLevy = levyTotal,
        TotalBond = bondTotal,
        TotalExpenses = totalExpenses,
        TotalIncome = totalIncome,  // ✅ Explicitly set
        Profit = profit              // ✅ Explicitly set
    };
}
    }
}