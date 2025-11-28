using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonoxProperty.Entities
{
    public class Lease
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey ("Property")]
        public int PropertyId { get; set; }
        public Property? Property { get; set; }

        [ForeignKey ("Tenant")]
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public DateTime Start { get; set; }
        public DateTime End { get; set; }

         public decimal Rent {  get; set; }
        public decimal Levy { get; set; }
        public decimal Bond { get; set; }
    }
}