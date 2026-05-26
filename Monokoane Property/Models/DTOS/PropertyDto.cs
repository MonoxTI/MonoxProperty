using System;
using System.Collections.Generic;


namespace MonoxProperty.Dtos
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string PropertyName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool Apartments { get; set; }
        public int Units { get; set; }
        public bool Occupied { get; set; }
        public int? ParentId { get; set; }  // null = top-level, set = unit
        public List<LeaseDto> Leases { get; set; } = new();
        public List<ExpenseDto> Expenses { get; set; } = new();
    }
}
