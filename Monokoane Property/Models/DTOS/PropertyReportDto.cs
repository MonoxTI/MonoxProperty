using System;
using System.Collections.Generic;

namespace MonoxProperty.Dtos
{
public class PropertyReportDto
{
    public string PropertyName { get; set; } = string.Empty;
    public string TenantName { get; set; }
    public decimal Rent { get; set; }
    public decimal Expenses { get; set; }
    public decimal Profit { get; set; }
}
}
