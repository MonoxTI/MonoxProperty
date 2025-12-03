using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping;
using MonoxProperty.Exceptions;
using AutoMapper;


namespace MonoxProperty.Controllers
{   
[ApiController]
[Route("api/tenant")]
public class TenantController : ControllerBase
{
    private readonly ITenantService services;
    public TenantController(ITenantService TenantService)
    {
        services = TenantService;
    }

    [HttpGet]
    public async Task<ActionResult> GetTenants()
    {
        var tenants = await services.GetAllTenant();
        return Ok(tenants);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetTenant(int id)
    {
        try
        {
            if(id<= 0)
            {
                return BadRequest( "Tenant ID required.");
            }
            var tenant = await services.GetTenant(id);
            if(tenant == null)
            {
                return NotFound($"Tenat with ID {id} not found ");
            }
            return Ok(tenant);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }

    [HttpPost]
    public async Task<ActionResult<TenantDto>> AddTenant([FromBody] TenantDto data)
    {
        try
        {
            var newTenant = await services.AddTenant(data);
            return CreatedAtAction(nameof(GetTenant),
            new {id = newTenant.Id},
            newTenant
            );
        }
        catch(DuplicateEntityException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateTenant(int id, [FromBody] TenantDto data)
    {
        try
        {    
            if(id <= 0 || data == null)
            {
                return BadRequest("Valid Tenant ID is required");
            }

            if(data.Id != id)
            {
                return BadRequest("Tenant ID mismatch between URL and body.");
            }
            var updatedTenant = await services.UpdateTenant(id, data);
            if(updatedTenant == null)
            {
                return NotFound($"Tenant with ID {id} not found." );
            }
            return Ok(updatedTenant);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing your request.", details = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteTenant(int id)
    {
        try
        {
            if(id <= 0)
            {
                return BadRequest("Valid Tenant ID is required");
            }

            var isDeleted = await services.DeleteTenant(id);
            if(!isDeleted)
            {
                return NotFound(new { message = $"Tenant with ID {id} not found." });
            }

            return Ok(new { message = "Tenant deleted successfully." });
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing your request.", details = ex.Message });
        }
    }
}
}