using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MonoxProperty.Entities
{
    public class Property
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string PropertyName { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        public bool Apartments { get; set; }

        public int Units { get; set; }

        // Parent-child relationship for apartment units
        public int? ParentId { get; set; }
        public Property? Parent { get; set; }
        public ICollection<Property> UnitsList { get; set; } = new List<Property>();

        public bool Occupied { get; set; }

        public decimal Rent { get; set; }
        public decimal Levy { get; set; }
        public decimal Bond { get; set; }
        public decimal Rates { get; set; }

        public ICollection<Lease>? Leases { get; set; } = new List<Lease>();
        public ICollection<Expense>? Expenses { get; set; }
    }
}