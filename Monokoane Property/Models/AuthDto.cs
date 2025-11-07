using System;
using System.Collections.Generic;


namespace MonoxProperty.Dtos
{
    public record AuthDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}