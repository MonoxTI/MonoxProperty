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
[Route("api/payment")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly PaymentService _paymentService;

    public PaymentController(PaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("record")]
    public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentDto dto)
    {
        await _paymentService.RecordPaymentAsync(dto.LeaseId, dto.Type, dto.Amount);
        return Ok("Payment recorded");
    }

    [HttpGet("summary/{month}")]
    public async Task<IActionResult> GetSummary(int year, int month)
    {
        var summary = await _paymentService.GetMonthlySummaryAsync(year, month);
        return Ok(summary);
    }
}

public class RecordPaymentDto
{
    public int LeaseId { get; set; }
    public PaymentType Type { get; set; }
    public decimal Amount { get; set; }
}
}