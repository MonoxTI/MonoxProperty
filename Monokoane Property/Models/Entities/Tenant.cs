using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MonoxProperty.Entities
{
    public class Tenant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Number { get; set; } = string.Empty;
        public DateTime LeaseStart { get; set; }
        public DateTime LeaseEnd { get; set; }

        public ICollection<Lease>? Leases { get; set; }
    }
}