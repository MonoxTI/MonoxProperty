using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MonoxProperty.Entities
{
    public class Property
    {
        [Key]
        public int Id {get; set;}

        [Required]
        public string PropertyName { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        public bool Apartments { get; set; }
        public int Units { get; set; }
        public bool Occupied { get; set; }
        public ICollection<Lease>? Leases { get; set;} = new List<Lease>();
        public ICollection<Expense>? Expenses { get; set;}
    }
}