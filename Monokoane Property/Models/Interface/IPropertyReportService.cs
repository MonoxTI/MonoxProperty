using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IPropertyReportService
    {
        Task SaveAsync(SaveReportDto dto);
        Task<byte[]> SaveAndExportAsync(SaveReportDto dto);
        Task<IEnumerable<ReportHistoryDto>> GetAllReportsAsync();
        Task<byte[]?> RedownloadReportAsync(int id);
        Task<PropertyAnalyticsDto> GetAnalyticsAsync();
        Task<byte[]?> ExportByPropertyAsync(string propertyName);
    }
}