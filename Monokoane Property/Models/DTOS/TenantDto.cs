using System;
using System.Collections.Generic;


namespace MonoxProperty.Dtos
{
    public class TenantDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        
    }
}