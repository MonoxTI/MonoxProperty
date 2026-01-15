using ClosedXML.Excel;
using MonoxProperty.Interfaces;
using MonoxProperty.Dtos;
using System.IO;

namespace MonoxProperty.Services
{
    public class ExcelService : IExcelExportService
    {
        public byte[] ExportPropertyFinance(List<ExcelDto> data)
{
    // Handle null or empty data
    if (data == null || data.Count == 0)
    {
        data = new List<ExcelDto> { new ExcelDto() };
    }

    using var workbook = new XLWorkbook();
    var sheet = workbook.Worksheets.Add("Property Finance");

    // Headers
    sheet.Cell(1, 1).Value = "Property Name";
    sheet.Cell(1, 2).Value = "Rent";
    sheet.Cell(1, 3).Value = "Levy";
    sheet.Cell(1, 4).Value = "Bond";
    sheet.Cell(1, 5).Value = "Expenses";
    sheet.Cell(1, 6).Value = "Income";
    sheet.Cell(1, 7).Value = "Profit";

    // Data rows
    for (int i = 0; i < data.Count; i++)
    {
        int row = i + 2;
        var item = data[i] ?? new ExcelDto(); // Handle null items

        sheet.Cell(row, 1).Value = item.PropertyName ?? "N/A";
        sheet.Cell(row, 2).Value = item.Rent;
        sheet.Cell(row, 3).Value = item.Levy;
        sheet.Cell(row, 4).Value = item.Bond;
        sheet.Cell(row, 5).Value = item.Expenses;

        // Formulas
        sheet.Cell(row, 6).FormulaA1 = $"=B{row}";
        sheet.Cell(row, 7).FormulaA1 = $"=B{row}-(C{row}+D{row}+E{row})";
    }

    sheet.Columns().AdjustToContents();

    using var stream = new MemoryStream();
    workbook.SaveAs(stream);
    return stream.ToArray();
}
    }
}