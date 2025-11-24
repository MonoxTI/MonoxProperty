using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonoxProperty.Entities
{
    public class Expense
    {
        [Key]
        public int  Id { get; set; }

        [ForeignKey("Property")]
        public int PropertyId { get; set; }
        public Property? Property { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime DateIncurred { get; set; } = DateTime.UtcNow;
    }
}