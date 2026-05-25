using Microsoft.EntityFrameworkCore;
using MonoxProperty.Dtos;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;

namespace MonoxProperty.Services
{
    public class PropertyReportService : IPropertyReportService
    {
        private readonly ApplicationDB _db;
        private readonly IExcelExportService _excel;

        public PropertyReportService(ApplicationDB db, IExcelExportService excel)
        {
            _db = db;
            _excel = excel;
        }

        public async Task<byte[]> SaveAsync(SaveReportDto dto)
        {
            var profit = dto.Rent - (dto.Levy + dto.Bond + dto.Rates + dto.Expenses)
            var report = new PropertyReport
            {
                PropertyName = dto.PropertyName,
                Month = dto.Month,
                Year = dto.Year,
                Rent = dto.Rent,
                Levy = dto.Levy,
                Bond = dto.Bond,
                Rates = dto.Rates,
                Expenses = dto.Expenses,
                Profit = profit,
                CreatedAt = DateTime.UtcNow   
            };

            _db.PropertyReports.Add(report);
            await _db.SaveChangesAsync();
        }

        public async Task<byte[]> SaveAndExportAsync(SaveReportDto dto)
        {
            var profit = dto.Rent - (dto.Levy + dto.Bond + dto.Rates + dto.Expenses);

            var report = new PropertyReport
            {
                PropertyName = dto.PropertyName,
                Month = dto.Month,
                Year = dto.Year,
                Rent = dto.Rent,
                Levy = dto.Levy,
                Bond = dto.Bond,
                Rates = dto.Rates,
                Expenses = dto.Expenses,
                Profit = profit,
                CreatedAt = DateTime.UtcNow
            };

            _db.PropertyReports.Add(report);
            await _db.SaveChangesAsync();

            var excelData = new List<ExcelDto>
            {
                new ExcelDto
                {
                    PropertyName = dto.PropertyName,
                    Rent = dto.Rent,
                    Levy = dto.Levy,
                    Bond = dto.Bond,
                    Rates = dto.Rates,
                    Expenses = dto.Expenses,
                    Profit = profit
                }
            };

            return await _excel.ExportPropertyFinanceAsync(excelData);
        }

        public async Task<IEnumerable<ReportHistoryDto>> GetAllReportsAsync()
        {
            return await _db.PropertyReports
                .OrderByDescending(r => r.Year)
                .ThenByDescending(r => r.Month)
                .Select(r => new ReportHistoryDto
                {
                    Id = r.Id,
                    PropertyName = r.PropertyName,
                    Month = r.Month,
                    Year = r.Year,
                    Rent = r.Rent,
                    Levy = r.Levy,
                    Bond = r.Bond,
                    Rates = r.Rates,
                    Expenses = r.Expenses,
                    Profit = r.Profit,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<byte[]?> RedownloadReportAsync(int id)
        {
            var report = await _db.PropertyReports.FindAsync(id);
            if (report == null) return null;

            var excelData = new List<ExcelDto>
            {
                new ExcelDto
                {
                    PropertyName = report.PropertyName,
                    Rent = report.Rent,
                    Levy = report.Levy,
                    Bond = report.Bond,
                    Rates = report.Rates,
                    Expenses = report.Expenses,
                    Profit = report.Profit
                }
            };

            return await _excel.ExportPropertyFinanceAsync(excelData);
        }

        public async Task<PropertyAnalyticsDto> GetAnalyticsAsync()
{
    var reports = await _db.PropertyReports
        .OrderBy(r => r.Year)
        .ThenBy(r => r.Month)
        .ToListAsync();

    // Profit by property
    var profitByProperty = reports
        .GroupBy(r => r.PropertyName)
        .Select(g => new PropertyProfitSummary
        {
            PropertyName = g.Key,
            TotalProfit = g.Sum(r => r.Profit),
            AverageProfit = g.Average(r => r.Profit),
            ReportCount = g.Count()
        })
        .OrderBy(p => p.TotalProfit)
        .ToList();

    // Monthly trend — one point per month, all properties
    var monthlyTrend = reports
        .GroupBy(r => new { r.Year, r.Month })
        .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
        .Select(g => new MonthlyTrendPoint
        {
            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
            Properties = g.Select(r => new PropertyMonthProfit
            {
                PropertyName = r.PropertyName,
                Profit = r.Profit
            }).ToList()
        })
        .ToList();

    // Underperforming = average profit is negative
    var underperforming = profitByProperty
        .Where(p => p.AverageProfit < 0)
        .Select(p => p.PropertyName)
        .ToList();

    return new PropertyAnalyticsDto
    {
        ProfitByProperty = profitByProperty,
        MonthlyTrend = monthlyTrend,
        UnderperformingProperties = underperforming
    };
}
    }
}