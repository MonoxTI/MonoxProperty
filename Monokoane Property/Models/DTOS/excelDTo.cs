using System;
using System.Collections.Generic;


namespace MonoxProperty.Dtos
{
public class ExcelDto
{
    public string PropertyName { get; set; }
    public decimal Rent { get; set; }
    public decimal Levy { get; set; }
    public decimal Bond { get; set; }
    public decimal Rates { get; set; }
    public decimal Expenses { get; set; }
    public decimal Profit { get; set; }
}
}