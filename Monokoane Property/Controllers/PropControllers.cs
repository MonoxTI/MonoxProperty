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
[Route("api/property")]
public class PropertyController : ControllerBase
{
    private readonly IPropertyService services;

    public PropertyController(IPropertyService propService)
    {
        services = propService;
    }

    [HttpPost]//adding
    public async Task<IActionResult> AddProperty([FromBody] PropertyDto propertyDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await services.AddProperty(propertyDto);
       return CreatedAtAction(nameof(GetPropertyByName), new { id = created.Id }, created);
    }

    [HttpGet]// GetAll
    public async Task<IActionResult> GetProperties()
    {
        var properties = await services.GetAllProperties();
        return Ok(properties);
    }

    [HttpGet("byname")]//get by name
    public async Task<IActionResult> GetPropertyByName([FromBody]dynamic data)
    {
        try{

            string name = data?.name;
            if(string.IsNullOrEmpty(name))
            {
                return BadRequest(new { message = "Property name is required." });
            }
            var property = await services.GetPropertyByName(name);
            if(property == null)
            return NotFound(new {message = $"Property {name} not found"});
            
            return Ok(property);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing your request.", details = ex.Message });
        }
    }


    [HttpPut("{id:int}")]//updating
     public async Task<IActionResult> UpdateProperty (string name, [FromBody] PropertyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await services.UpdateProperty(name, dto);
            if (updated == null)
                return NotFound(new { message = $"Property with ID {name} not found." });

            return Ok(updated);
        }

          [HttpDelete("{id:int}")]//Delete
        public async Task<IActionResult> DeleteProperty(string name)
        {
            var success = await services.DeleteProperty(name);
            if (!success)
                return NotFound(new { message = $"Property with ID {name} not found." });

            return NoContent();
        }
} 
}