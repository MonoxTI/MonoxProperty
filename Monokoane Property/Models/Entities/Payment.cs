// Entities/Payment.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonoxProperty.Entities
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        public int LeaseId { get; set; }
        public Lease Lease { get; set; } = null!;

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Required]
        public PaymentType Type { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
    }

    public enum PaymentType
    {
        Rent,
        Levy,
        Bond
    }
}