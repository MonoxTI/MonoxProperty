namespace MonoxProperty.Dtos
{
    public class ReportHistoryDto
    {
        public int Id { get; set; }
        public string PropertyName { get; set; } = string.Empty;
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Rent { get; set; }
        public decimal Levy { get; set; }
        public decimal Bond { get; set; }
        public decimal Rates { get; set; }
        public decimal Expenses { get; set; }
        public decimal Profit { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}