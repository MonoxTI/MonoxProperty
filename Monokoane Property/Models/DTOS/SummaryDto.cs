// MonoxProperty.Dtos.SummaryDto
namespace MonoxProperty.Dtos
{
    public class SummaryDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalRent { get; set; }
        public decimal TotalLevy { get; set; }
        public decimal TotalBond { get; set; }
        public decimal TotalRates { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal TotalIncome { get; set; } // 👈 Explicit property
        public decimal Profit { get; set; }      // 👈 Explicit property
    }
}