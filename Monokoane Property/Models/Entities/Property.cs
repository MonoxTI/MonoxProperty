using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MonoxProperty.Entities
{
    public class Property
    {
        [Key]
        public int ID {get; set;}

        [Required]
        public string PropertyName { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        public bool Apartments { get; set; }
        public int Units { get; set; }
        public decimal Rent { get; set; }
        public decimal Levy { get; set; }
        public decimal Bond { get; set; }
        public bool Occupied { get; set; }

        public ICollection<Lease>? Leases { get; set;}
        public ICollection<Expense>? Expenses { get; set;}
    }
}