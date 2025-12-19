using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping;
using MonoxProperty.Exceptions;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;

namespace MonoxProperty.Controllers
{
    [ApiController]
    [Route("api/pay")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ExcelExportService _excelService;

        public PaymentController(IPaymentService paymentService, ExcelExportService excelService)
        {
            _paymentService = paymentService;
            _excelService = excelService;
        }

    [HttpPost("record")]
    public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentDto dto)
    {
        await _paymentService.RecordPaymentAsync(dto.LeaseId, dto.Type, dto.Amount);
        return Ok(new { message = "Payment recorded successfully" });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int year, [FromQuery] int month)
    {
        var summary = await _paymentService.GetMonthlySummaryAsync(year, month);
        return Ok(summary);
    }

    [HttpPost("property-report")]
    public async Task<IActionResult> GetPropertyReport([FromBody] PropertyReportDto request)
    {
        if (string.IsNullOrWhiteSpace(request?.PropertyName))
            return BadRequest("Property name is required.");

        var report = await _paymentService.GetMonthlySummary(request.PropertyName);
        if (report == null)
            return NotFound($"Property '{request.PropertyName}' not found.");

        return Ok(report);
    }
/*
    [HttpGet("reports/property-excel")]
    public async Task<IActionResult> ExportPropertyExcel(
    [FromQuery] int year,
    [FromQuery] int month)
    {
    var data = await _reportService.GetPropertyReportAsync(year, month);

    if (!data.Any())
        return NotFound("No data found for the selected month.");

    var file = _excelService.ExportMonthlySummaryPerProperty(
        data,
        year,
        month
    );

    return File(
        file,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        $"PropertyReport_{month}_{year}.xlsx"
    );
}
*/
    }
}
