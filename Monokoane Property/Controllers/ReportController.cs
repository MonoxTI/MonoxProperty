using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;

namespace MonoxProperty.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly IPropertyReportService _reportService;

        public ReportController(IPropertyReportService reportService)
        {
            _reportService = reportService;
        }

        // POST /api/reports/save — saves to DB, no file download
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] SaveReportDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.PropertyName))
                return BadRequest(new { error = "Property name is required." });

            if (dto.Month < 1 || dto.Month > 12)
                return BadRequest(new { error = "Month must be between 1 and 12." });

            if (dto.Year < 2000 || dto.Year > 2100)
                return BadRequest(new { error = "Invalid year." });

            await _reportService.SaveAsync(dto);

            var monthName = new DateTime(dto.Year, dto.Month, 1).ToString("MMMM yyyy");

            return Ok(new
            {
                message = $"Report for {dto.PropertyName} ({monthName}) saved successfully."
            });
        }

        // POST /api/reports/save-export — saves to DB and returns Excel file
        [HttpPost("save-export")]
        public async Task<IActionResult> SaveAndExport([FromBody] SaveReportDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.PropertyName))
                return BadRequest(new { error = "Property name is required." });

            if (dto.Month < 1 || dto.Month > 12)
                return BadRequest(new { error = "Month must be between 1 and 12." });

            if (dto.Year < 2000 || dto.Year > 2100)
                return BadRequest(new { error = "Invalid year." });

            var file = await _reportService.SaveAndExportAsync(dto);
            var monthName = new DateTime(dto.Year, dto.Month, 1).ToString("MMMM_yyyy");
            var fileName = $"{dto.PropertyName.Replace(" ", "_")}_{monthName}.xlsx";

            return File(
                file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }

        // GET /api/reports — returns all saved reports
        [HttpGet]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _reportService.GetAllReportsAsync();
            return Ok(reports);
        }

        // GET /api/reports/{id}/download — re-download a past report
        [HttpGet("{id}/download")]
        public async Task<IActionResult> RedownloadReport(int id)
        {
            var file = await _reportService.RedownloadReportAsync(id);
            if (file == null)
                return NotFound(new { error = $"Report with id {id} not found." });

            return File(
                file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"report_{id}.xlsx"
            );
        }

        // GET /api/reports/analytics
        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var analytics = await _reportService.GetAnalyticsAsync();
            return Ok(analytics);
        }

        // GET /api/reports/export/{propertyName}
// Pulls all saved reports for a property and returns Excel
[HttpGet("export/{propertyName}")]
public async Task<IActionResult> ExportByProperty(string propertyName)
{
    if (string.IsNullOrWhiteSpace(propertyName))
        return BadRequest(new { error = "Property name is required." });

    var file = await _reportService.ExportByPropertyAsync(propertyName);
    if (file == null)
        return NotFound(new { error = $"No reports found for '{propertyName}'." });

    var fileName = $"{propertyName.Replace(" ", "_")}_AllReports.xlsx";
    return File(file,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileName);
}
    }
}