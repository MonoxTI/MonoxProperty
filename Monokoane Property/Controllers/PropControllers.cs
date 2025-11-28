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

    [HttpGet]// GetAll
    public async Task<IActionResult> GetProperties()
    {
        var properties = await services.GetAllProperties();
        return Ok(properties);
    }

    [HttpPost("byname")]//get by name
    public async Task<IActionResult> GetPropertyByName([FromBody] PropertyDto data)
    {
        try{
            string name = data.PropertyName;
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

     [HttpPost("add")]//adding
    public async Task<IActionResult> AddProperty([FromBody] PropertyDto data)
    {
        try
        {
             var addedProp = await services.AddProperty(data);
             return CreatedAtAction(nameof(GetPropertyByName),
             new { propertyName = addedProp.PropertyName },
             addedProp);

        }
        catch ( DuplicatePropertyNameException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message});
        }
    }


    [HttpPut("update")]//updating
     public async Task<IActionResult> UpdateProperty ([FromBody] PropertyDto dto)
        {

            if (dto == null || string.IsNullOrEmpty(dto.PropertyName))
                return BadRequest(new { message = "Property name is required." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await services.UpdateProperty(dto.PropertyName, dto);
            if (updated == null)
                return NotFound(new { message = $"Property with ID {dto.PropertyName} not found." });

            return Ok(new {message = "Property updated successfully."});
        }

          [HttpDelete("delete")]//Delete
        public async Task<IActionResult> DeleteProperty(string PropertyName)
        {
            var success = await services.DeleteProperty(PropertyName);
            if (!success)
                return NotFound(new { message = $"Property with ID {PropertyName} not found." });

            return NoContent();
        }
} 
}