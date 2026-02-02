using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
public interface IExcelExportService
{
    Task<byte[]> ExportPropertyFinanceAsync(IEnumerable<ExcelDto> data);
}
}