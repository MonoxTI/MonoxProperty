using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonoxProperty.Entities
{
    public class Lease
    {
        [Key]
        public int Id { get; set; }

        public int PropertyId { get; set; }
        public Property? Property { get; set; }

        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; } = null!;

        [Required]
        public DateTime Start { get; set; }
        [Required]
        public DateTime End { get; set; }
        [Range(0, double.MaxValue)]
        public decimal Rent {  get; set; }
        [Range(0, double.MaxValue)]
        public decimal Levy { get; set; }
        [Range(0, double.MaxValue)]
        public decimal Bond { get; set; }
    }
}