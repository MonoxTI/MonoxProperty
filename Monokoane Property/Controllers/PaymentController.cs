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

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
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
        if (year < 1 || year > 9999)
        return BadRequest("Year must be between 1 and 9999.");
        
        if (month < 1 || month > 12)
        return BadRequest("Month must be between 1 and 12.");
        
        var summary = await _paymentService.GetMonthlySummaryAsync(year, month);
        return Ok(summary);
        
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
    }
}