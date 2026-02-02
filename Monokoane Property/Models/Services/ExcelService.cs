using ClosedXML.Excel;
using MonoxProperty.Interfaces;
using MonoxProperty.Dtos;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MonoxProperty.Services
{
    public class ExcelService : IExcelExportService
    {
        public async Task<byte[]> ExportPropertyFinanceAsync(IEnumerable<ExcelDto> data)
        {
            var rows = data?.ToList() ?? new List<ExcelDto>();

            if (!rows.Any())
            {
                rows.Add(new ExcelDto());
            }

            using var workbook = new XLWorkbook();
            var sheet = workbook.Worksheets.Add("Property Finance");

            // Headers
            sheet.Cell(1, 1).Value = "Property Name";
            sheet.Cell(1, 2).Value = "Rent";
            sheet.Cell(1, 3).Value = "Levy";
            sheet.Cell(1, 4).Value = "Bond";
            sheet.Cell(1, 5).Value = "Expenses";
            sheet.Cell(1, 6).Value = "Profit";

            // Styling headers
            sheet.Range(1, 1, 1, 6).Style.Font.Bold = true;

            int row = 2;

            foreach (var item in rows)
            {
                sheet.Cell(row, 1).Value = item.PropertyName ?? "N/A";
                sheet.Cell(row, 2).Value = item.Rent;
                sheet.Cell(row, 3).Value = item.Levy;
                sheet.Cell(row, 4).Value = item.Bond;
                sheet.Cell(row, 5).Value = item.Expenses;

                // Profit formula
                sheet.Cell(row, 6).FormulaA1 =
                    $"=B{row}-(C{row}+D{row}+E{row})";

                row++;
            }

            // Currency formatting
            sheet.Columns(2, 6).Style.NumberFormat.Format = "R #,##0.00";

            sheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);

            return await Task.FromResult(stream.ToArray());
        }
    }
}
