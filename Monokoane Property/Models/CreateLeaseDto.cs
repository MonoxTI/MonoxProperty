using System;
using System.Collections.Generic;


namespace Property
{
    public class CreateLeaseDto
    {
        public int PropertyId { get; set; }
        public int TenantId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
}