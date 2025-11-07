using System;
using System.Collections.Generic;


namespace MonoxProperty.Dtos
{
    public class CreatePropertyDto
    {
        public string PropertyName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool Apartments { get; set; }
        public int Units { get; set; }
        public decimal Rent { get; set; }
        public decimal Levy { get; set; }
        public decimal Bond { get; set; }
    }
}
