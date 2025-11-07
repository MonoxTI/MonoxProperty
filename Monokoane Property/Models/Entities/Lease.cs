using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonoxProperty.Entities
{
    public class Lease
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey ("Property")]
        public int PropertyId { get; set; }
        public Property Property { get; set; }

        [ForeignKey ("Tenant")]
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; }

        public DateTime Start { get; set; }
        public DateTime End { get; set; }

        public decimal RentAmount { get; set; }
    }
}