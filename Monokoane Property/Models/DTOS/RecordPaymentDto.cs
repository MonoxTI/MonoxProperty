using MonoxProperty.Entities;

namespace MonoxProperty.Dtos
{
    public class RecordPaymentDto
    {
        public int LeaseId { get; set; }
        public PaymentType Type { get; set; }
        public decimal Amount { get; set; }
    }
}
