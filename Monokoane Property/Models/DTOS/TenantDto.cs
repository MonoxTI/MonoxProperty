using System;
using System.Collections.Generic;


namespace MonoxProperty.Dtos
{
    public class TenantDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        
    }
}