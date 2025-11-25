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
public class TenantController : ControllerBase
{
    private readonly ITenantService services;
    public LeaseController(ITenantService TenantService)
    {
        services = TenantService;
    }
    [HttpGet]
    public async Task<IActionResult> GetTenants()
    {
        var tenants = await services.GetAllTenant();
        return ok(tenants);
    }

    [HttpPost("byID")]
    public async Task<IActionResult> GetTenant([FromBody] TenantDto data )
    {
        try
        {
            int id = data.Id;
            if(id <= 0)
            {
                return BadRequest(new {message = "Tenant ID required."});
            }
            var tenant = await services.GetTenant(id);
            if(tenant == null)
            return NotFound(new {message= $"{tenant} not found "});

            return ok(tenant);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }

    [HttpPost ("add")]
    public async Task<IActionResult> AddTenant([FromBody] TenantDto data)
    {
        try
        {
            string tenant = data.id;
            if(string.IsNullOrEmpty(tenant) || data == null)
            {
                return BadRequest(new { message = "Tenant name is required" });
            }
            var newTenant = await services.AddTenant(data);
            return CreatedAtAction(nameof(GetTenant),
            new {tenant= addedTenant.Id},
            addedTenant
            );
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing your request.", details = ex.Message });
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateTenant([FromBody] TenantDto data)
    {
        try
        {
            int id = data.Id;
            if(id <= 0 || data == null)
            {
                return BadRequest(new { message = "Valid Tenant ID is required" });
            }

            var updatedTenant = await services.UpdateTenant(id, data);
            if(updatedTenant == null)
            {
                return NotFound(new { message = $"Tenant with ID {id} not found." });
            }

            return Ok(updatedTenant);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing your request.", details = ex.Message });
        }
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteTenant([FromBody] TenantDto data)
    {
        try
        {
            int id = data.Id;
            if(id <= 0)
            {
                return BadRequest(new { message = "Valid Tenant ID is required" });
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