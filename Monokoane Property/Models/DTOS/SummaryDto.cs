using System;
using System.Collections.Generic;

namespace MonoxProperty.Dtos
{
public class SummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalRent { get; set; }
    public decimal TotalLevy { get; set; }
    public decimal TotalBond { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalIncome => TotalRent;
    public decimal Profit => TotalIncome - (TotalBond + TotalLevy + TotalExpenses);
}
}