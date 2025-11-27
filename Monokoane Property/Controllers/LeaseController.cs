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
        return Ok(leases);
    }

    [HttpPost("byID")]
    public async Task<IActionResult> GetLeasebyId([FromBody] LeaseDto data )
    {
        try
        {
            int id = data.Id;
            if(id <= 0 || data == null)
            {
                return BadRequest(new {message = "Lease ID required."});
            }
            var lease = await services.GetLeasebyId(id);
            if(lease == null)
            return NotFound(new {message= $"lease with id {id} not found "});

            return Ok(lease);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }

    [HttpPost ("add")]
    public async Task<IActionResult> AddLease([FromBody] LeaseDto data)
    {
        try
        {
            if(data == null)
            {
                return BadRequest(new { message = "Lease data is required."});
            }

            var addedlease = await services.AddLease(data);

            return CreatedAtAction(
                nameof(GetLeasebyId),
                new {Id = addedlease.Id},
                addedlease
                );
        }
        catch(Exception ex)
        {
            return StatusCode(500, new{ message = "An error occurred while processing your request.", details = ex.Message });
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateLease ([FromBody] LeaseDto dto)
    {
        if(dto == null || dto.Id <= 0)
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
            if(dto == null || dto.Id <= 0)
            {
                return BadRequest(new { message = "Lease ID is required." });
            }

            var deleted = await services.DeleteLease(dto.Id);
            if(!deleted)
            {
                return NotFound(new { message = $"Lease with id {dto.Id} not found." });
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
