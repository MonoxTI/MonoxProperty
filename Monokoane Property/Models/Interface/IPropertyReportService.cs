using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IPropertyReportService
    {
        Task<byte[]> SaveAsync(SaveReportDto dto)
        Task<byte[]> SaveAndExportAsync(SaveReportDto dto);
        Task<IEnumerable<ReportHistoryDto>> GetAllReportsAsync();
        Task<byte[]?> RedownloadReportAsync(int id);
        Task<PropertyAnalyticsDto> GetAnalyticsAsync();
    }
}