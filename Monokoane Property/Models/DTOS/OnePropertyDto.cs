using System;
using System.Collections.Generic;


namespace MonoxProperty.Dtos
{
    public class OnePropertyDto
    {
        public string PropertyName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool Apartments { get; set; }
        public int Units { get; set; }
       public bool Occupied { get; set; }
    }
}
