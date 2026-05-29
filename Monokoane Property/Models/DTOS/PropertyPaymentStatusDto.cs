using System;
using System.Collections.Generic;

namespace MonoxProperty.Dtos
{
    public class PropertyPaymentStatusDto
    {
        public string PropertyName { get; set; } = string.Empty;
        public List<MonthPaymentSummary> Months { get; set; } = new();
    }

    public class MonthPaymentSummary
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string Period { get; set; } = string.Empty;
        public List<TenantPaymentStatus> Tenants { get; set; } = new();
    }

    public class TenantPaymentStatus
    {
        public string TenantName { get; set; } = string.Empty;
        public int LeaseId { get; set; }
        public decimal ExpectedRent { get; set; }
        public decimal ExpectedLevy { get; set; }
        public decimal ExpectedBond { get; set; }
        public decimal ExpectedRates { get; set; }
        public bool PaidRent { get; set; }
        public bool PaidLevy { get; set; }
        public bool PaidBond { get; set; }
        public bool PaidRates { get; set; }
        public decimal RentAmount { get; set; }
        public decimal LevyAmount { get; set; }
        public decimal BondAmount { get; set; }
        public decimal RatesAmount { get; set; }
    }
}