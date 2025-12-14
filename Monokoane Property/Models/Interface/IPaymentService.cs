using MonoxProperty.Dtos;
using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{
    public interface IPaymentService
    {
        Task RecordPaymentAsync(int leaseId, PaymentType type, decimal amount);
        Task<SummaryDto> GetMonthlySummaryAsync(int year, int month);
    }
}
