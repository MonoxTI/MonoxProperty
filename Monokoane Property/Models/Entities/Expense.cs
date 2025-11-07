using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonoxProperty.Entities
{
    public class Expense
    {
        [Key]
        public int  ID { get; set; }

        [ForeignKey("Property")]
        public int PropertyId { get; set; }
        public Property Property { get; set; }

        [Required]
        public string Descriptioin { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime DateIncurred { get; set; } = DateTime.UtcNow;
    }
}