namespace MonoxProperty.Dtos
{
    public class PropertyAnalyticsDto
    {
        public List<PropertyProfitSummary> ProfitByProperty { get; set; } = new();
        public List<MonthlyTrendPoint> MonthlyTrend { get; set; } = new();
        public List<string> UnderperformingProperties { get; set; } = new();
    }

    public class PropertyProfitSummary
    {
        public string PropertyName { get; set; } = string.Empty;
        public decimal TotalProfit { get; set; }
        public decimal AverageProfit { get; set; }
        public int ReportCount { get; set; }
    }

    public class MonthlyTrendPoint
    {
        public string Period { get; set; } = string.Empty; // e.g. "Jan 2025"
        public List<PropertyMonthProfit> Properties { get; set; } = new();
    }

    public class PropertyMonthProfit
    {
        public string PropertyName { get; set; } = string.Empty;
        public decimal Profit { get; set; }
    }
}