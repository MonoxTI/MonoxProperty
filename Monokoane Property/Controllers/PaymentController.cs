using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace MonoxProperty.Controllers
{
    [ApiController]
    [Route("api/pay")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IPropertyRepo _propertyRepository;
        private readonly IExcelExportService _excelExportService;

        public PaymentController(IPaymentService paymentService, IPropertyRepo propertyRepository, IExcelExportService excelExportService)
        {
            _paymentService = paymentService;
            _propertyRepository = propertyRepository;
            _excelExportService = excelExportService;
        }

        [HttpPost("record")]
        public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentDto dto)
        {
            try
            {
                await _paymentService.RecordPaymentAsync(dto.LeaseId, dto.Type, dto.Amount);
                return Ok(new { message = "Payment recorded successfully" });
            }
            
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            
        }

        //Power bi integration endpoint
      [HttpGet("summary")]
      public async Task<IActionResult> GetSummary([FromQuery] int year, [FromQuery] int month)
      {
        try
        {
        if (year < 1 || year > 9999)
            return BadRequest("Year must be between 1 and 9999.");
        
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12.");

        var summary = await _paymentService.GetMonthlySummaryAsync(year, month);
        return Ok(summary);
        }
        catch (Exception ex)
        {
        // Log ex.Message and ex.StackTrace
        Console.WriteLine($"ERROR: {ex}");
        return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

        [HttpPost("property-report")]
        public async Task<IActionResult> GetPropertyReport([FromBody] PropDto request)
        {
            if (string.IsNullOrWhiteSpace(request?.PropertyName))
            return BadRequest("Property name is required.");
            
            var report = await _paymentService.GetMonthlySummary(request.PropertyName);
            if (report == null)
            
            return NotFound($"Property '{request.PropertyName}' not found.");
            
            return Ok(report);
            
        }

       [HttpGet("export/finance")]
public async Task<IActionResult> ExportPropertyFinance()
{
    var properties = await _propertyRepository.GetAllAsync();

    var data = properties.Select(p => new ExcelDto
    {
        PropertyName = p.PropertyName,
        Rent = p.Rent,
        Levy = p.Levy,
        Bond = p.Bond,
        Expenses = p.Expenses.Sum(e => e.Amount) // Note: "Expenses" (plural) to match your DTO
    }).ToList();

    var file = _excelExportService.ExportPropertyFinance(data);

    return File(
        file,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "property_finance.xlsx"
    );
}

    }
}