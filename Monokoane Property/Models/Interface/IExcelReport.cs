using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
public interface IExcelExportService
{
    byte[] ExportPropertyFinance(List<ExcelDto> data);
}
}