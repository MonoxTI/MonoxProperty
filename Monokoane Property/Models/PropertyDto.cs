using System;
using System.Collections.Generic;


namespace Property
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string PropertyName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool Apartments { get; set; }
        public int Units { get; set; }
        public decimal Rent {  get; set; }
        public decimal Levy { get; set; }
        public decimal Bond { get; set; }
        public bool Occupied { get; set; }
        public List<ExpenseDto> Expenses { get; set; } = new();
    }
}
