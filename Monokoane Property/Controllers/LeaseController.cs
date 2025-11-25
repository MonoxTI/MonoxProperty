using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping;
using AutoMapper;


namespace MonoxProperty.Controllers
{   
[ApiController]
[Route("api/lease")]
public class LeaseController : ControllerBase
{
    private readonly ILeaseService services;
    public LeaseController(ILeaseService LeaseService)
    {
        services = LeaseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLeases()
    {
        var leases = await services.GetAllLeases();
        return ok(leases);
    }

    [HttpPost("byID")]
    public async Task<IActionResult> GetLeasebyId([FromBody] LeaseDto data )
    {
        try
        {
            int id = data.Id;
            if(id <= 0)
            {
                return BadRequest(new {message = "Lease required."});
            }
            var lease = await services.GetLeasebyId(id);
            if(lease == null)
            return NotFound(new {message= $"{lease} not found "});

            return ok(lease);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }

    [HttpPost ("add")]
    public aync Task<IActionResult> AddLease([FromBody] LeaseDto data)
    {
        try
        {
            string lease = data.Id;
            if(string.IsNullOrEmpty(lease) || data == null)
            {
                return BadRequest(new { message = "Leaseid is required" });
            }

            var addedlease = await services.addedlease(data);

            return CreatedAtAction(nameof(GetLeasebyId),
            new {lease = addedlease.Id},
            addedlease
            );
        }
        catch(Exception ex)
        {
            return StatusCode(500, new{ message = "An error occurred while processing your request.", details = ex.Message });
        }
    }

    [HttpPut("update")]
    public aysnc Tasl<IActionResult> UpdateLease ([FromBody] LeaseDto dto)
    {
        if(dto == null || string.IsNullOrEmpty(dto.Id))
        return BadRequest(new { message = "Lease id is required." });

        if(!ModelState.IsValid)
        return BadRequest(ModelState);

        var updatedLease = await services.UpdateLease(dto.Id, dto);
        if(updatedLease == null)
        return NotFound(new { message = $"Lease with id {dto.Id} not found." });

        return Ok(new { message = "Lease updated successfully.", lease = updatedLease });
    }


    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteLease ([FromBody] LeaseDto dto)
    {
        try
        {
            string id = dto.Id;
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "Lease id is required." });
            }

            var deleted = await services.DeleteLease(id);
            if(!deleted)
            {
                return NotFound(new { message = $"Lease with id {id} not found." });
            }

            return Ok(new { message = "Lease deleted successfully." });
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing your request.", details = ex.Message });
        }
    }
}
}
