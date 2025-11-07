using System;
using System.Collections.Generic;


namespace Property
{
    public class CreateExpenseDto
    {
        public int PropertyId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;

    }
}