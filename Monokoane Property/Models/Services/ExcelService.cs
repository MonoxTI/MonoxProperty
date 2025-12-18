using ClosedXML.Excel;

public class ExcelExportService
{
    public byte[] ExportMonthlySummaryPerProperty(
        List<ExcelDto> data,
        int year,
        int month)
    {
        using var workbook = new XLWorkbook();

        var groupedProperties = data.GroupBy(x => x.PropertyName);

        foreach (var propertyGroup in groupedProperties)
        {
            var sheet = workbook.Worksheets.Add(propertyGroup.Key);

            sheet.Cell(1, 1).Value = "Property";
            sheet.Cell(1, 2).Value = propertyGroup.Key;

            sheet.Cell(2, 1).Value = "Month";
            sheet.Cell(2, 2).Value = $"{month}/{year}";

            sheet.Cell(4, 1).Value = "Rent";
            sheet.Cell(5, 1).Value = "Levy";
            sheet.Cell(6, 1).Value = "Bond";
            sheet.Cell(7, 1).Value = "Rates";
            sheet.Cell(8, 1).Value = "Expenses";
            sheet.Cell(10, 1).Value = "Profit";

            sheet.Cell(4, 2).Value = propertyGroup.Sum(x => x.Rent);
            sheet.Cell(5, 2).Value = propertyGroup.Sum(x => x.Levy);
            sheet.Cell(6, 2).Value = propertyGroup.Sum(x => x.Bond);
            sheet.Cell(7, 2).Value = propertyGroup.Sum(x => x.Rates);
            sheet.Cell(8, 2).Value = propertyGroup.Sum(x => x.Expenses);
            sheet.Cell(10, 2).Value = propertyGroup.Sum(x => x.Profit);

            sheet.Columns().AdjustToContents();
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
