using ClosedXML.Excel;
using MonoxProperty.Interfaces;
using MonoxProperty.Dtos;

namespace MonoxProperty.Services
{
    public class ExcelService : IExcelExportService
    {
        public async Task<byte[]> ExportPropertyFinanceAsync(IEnumerable<ExcelDto> data)
        {
            var rows = data?.ToList() ?? new List<ExcelDto>();

            if (!rows.Any())
                rows.Add(new ExcelDto());

            using var workbook = new XLWorkbook();
            var sheet = workbook.Worksheets.Add("Property Finance");

            // ── Headers ──────────────────────────────────────────────
            string[] headers = { "Property Name", "Rent", "Levy", "Bond", "Rates", "Expenses", "Profit" };
            for (int i = 0; i < headers.Length; i++)
                sheet.Cell(1, i + 1).Value = headers[i];

            // Header styling — bold, white text, dark green background
            var headerRange = sheet.Range(1, 1, 1, headers.Length);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Font.FontColor = XLColor.White;
            headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#1A5276"); // dark blue
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            headerRange.Style.Border.BottomBorder = XLBorderStyleValues.Medium;

            // ── Data rows ────────────────────────────────────────────
            int row = 2;
            foreach (var item in rows)
            {
                sheet.Cell(row, 1).Value = item.PropertyName ?? "N/A";
                sheet.Cell(row, 2).Value = item.Rent;
                sheet.Cell(row, 3).Value = item.Levy;
                sheet.Cell(row, 4).Value = item.Bond;
                sheet.Cell(row, 5).Value = item.Rates;   // ← was missing
                sheet.Cell(row, 6).Value = item.Expenses;

                // Profit = Rent - (Levy + Bond + Rates + Expenses)
                sheet.Cell(row, 7).FormulaA1 =
                    $"=B{row}-(C{row}+D{row}+E{row}+F{row})";

                // Zebra striping for readability
                if (row % 2 == 0)
                {
                    sheet.Range(row, 1, row, headers.Length)
                         .Style.Fill.BackgroundColor = XLColor.FromHtml("#EBF5FB");
                }

                row++;
            }

            // ── Totals row ───────────────────────────────────────────
            int totalRow = row;
            sheet.Cell(totalRow, 1).Value = "TOTAL";
            sheet.Cell(totalRow, 1).Style.Font.Bold = true;

            // SUM each numeric column
            for (int col = 2; col <= 7; col++)
            {
                char colLetter = (char)('A' + col - 1);
                sheet.Cell(totalRow, col).FormulaA1 = $"=SUM({colLetter}2:{colLetter}{totalRow - 1})";
                sheet.Cell(totalRow, col).Style.Font.Bold = true;
            }

            var totalRange = sheet.Range(totalRow, 1, totalRow, headers.Length);
            totalRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#1A5276");
            totalRange.Style.Font.FontColor = XLColor.White;
            totalRange.Style.Border.TopBorder = XLBorderStyleValues.Medium;

            // ── Formatting ───────────────────────────────────────────
            // Currency format on all numeric columns (B through G)
            sheet.Columns(2, 7).Style.NumberFormat.Format = "R #,##0.00";

            // Profit column: red if negative
            var profitCol = sheet.Range(2, 7, totalRow, 7);
            profitCol.AddConditionalFormat()
                .WhenLessThan(0)
                .Fill.SetBackgroundColor(XLColor.FromHtml("#FADBD8"));

            sheet.Columns().AdjustToContents();
            // Minimum width for property name column
            if (sheet.Column(1).Width < 20) sheet.Column(1).Width = 20;

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return await Task.FromResult(stream.ToArray());
        }
    }
}