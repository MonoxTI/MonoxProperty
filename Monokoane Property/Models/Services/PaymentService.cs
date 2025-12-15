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

        public async Task<SummaryDto> GetMonthlySummaryAsync(int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
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

            var ExpenseTotal = await _db.Expenses
                .Where(e => e.DateIncurred >= startDate &&
                            e.DateIncurred < endDate)
                .SumAsync(e => e.Amount);

            return new SummaryDto
            {
                Year = year,
                Month = month,
                TotalRent = rentTotal,
                TotalLevy = levyTotal,
                TotalBond = bondTotal,
                TotalExpenses = ExpenseTotal
            };
        }
    }
}
