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
    public async Task<ActionResult<IEnumerable<LeaseDto>>> GetLeases()
    {
        var leases = await services.GetAllLeases();
        return Ok(leases);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LeaseDto>> GetLeasebyId(int id)
    {
            if(id <= 0)
            {
                return BadRequest("Lease ID required.");
            }
            var lease = await services.GetLeasebyId(id);
            if(lease == null)
            return NotFound($"lease with id {id} not found ");

            return Ok(lease);
    }

    [HttpPost("add")]
    public async Task<ActionResult<LeaseDto>> AddLease([FromBody] LeaseDto data)
    {
        try
        {
            if(data == null)
            {
                return BadRequest("Lease data is required.");
            }

            var addedlease = await services.AddLease(data);

            return CreatedAtAction(
                nameof(GetLeasebyId),
                new {id = addedlease.Id},
                addedlease
                );
        }catch(DuplicateleaseException ex)
        {
            return BadRequest(new { message = ex.Message });
        }catch(ArgumentException ex)
        {
            return BadRequest(new {message = ex.Message });
        }
    }
    

    [HttpPut("int{id}")]
    public async Task<ActionResult<LeaseDto>> UpdateLease (int id, [FromBody] LeaseDto dto)
    {
        if(dto == null || id <= 0)
        return BadRequest(new { message = "Lease id is required." });

        if(dto.Id != id)
        {
            return BadRequest("Lease ID mismatch between URL and body." );
        }

        var updatedLease = await services.UpdateLease(id, dto);
        if(updatedLease == null)
        return NotFound($"Lease with id {id} not found." );

        return Ok(updatedLease);
    }


    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteLease (int id)
    {
            if(id <= 0)
            {
                return BadRequest("Lease ID is required." );
            }

            var deleted = await services.DeleteLease(id);
            if(!deleted)
            {
                return NotFound("Lease with id {id} not found." );
            }

            return Ok(new { message = "Lease deleted successfully." });
        }
    }
}

