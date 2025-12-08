using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using Microsoft.EntityFrameworkCore;

namespace MonoxProperty.Repository
{

public class PaymentService
{
    private readonly ApplicationDB _db;

    public PaymentService(ApplicationDB db)
    {
        _db = db;
    }

    public async Task RecordPaymentAsync(int leaseId, PaymentType type, decimal amount)
    {
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

    public async Task<FinancialSummaryDto> GetMonthlySummaryAsync(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var rentTotal = await _db.Payments
            .Where(p => p.Type == PaymentType.Rent && p.PaymentDate >= startDate && p.PaymentDate < endDate)
            .SumAsync(p => p.Amount);

        var levyTotal = await _db.Payments
            .Where(p => p.Type == PaymentType.Levy && p.PaymentDate >= startDate && p.PaymentDate < endDate)
            .SumAsync(p => p.Amount);

        var bondTotal = await _db.Payments
            .Where(p => p.Type == PaymentType.Bond && p.PaymentDate >= startDate && p.PaymentDate < endDate)
            .SumAsync(p => p.Amount);

        return new FinancialSummaryDto
        {
            Month = month,
            Year = year,
            TotalRent = rentTotal,
            TotalLevy = levyTotal,
            TotalBond = bondTotal,
            TotalIncome = rentTotal + levyTotal,
            Profit = (rentTotal + levyTotal) - bondTotal
        };
    }
}
}