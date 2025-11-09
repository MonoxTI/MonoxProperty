using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping
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
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet]// GetAll
    public async Task<IActionResult> GetProperties()
    {
        var properties = await services.GetAllProperties();
        return Ok(properties);
    }

    [HttpGet("{id:int}")]//get by id
    public async Task<IActionResult> GetPropertyById(int id)
    {
        var property = await services.GetPropertyById(id);
        if(property == null)
        return NotFound(new {message = $"Property with ID:{id} not found"});

        return Ok(property);
    }


    [HttpPut("{id:int}")]//updating
     public async Task<IActionResult> UpdateProperty (int id, [FromBody] PropertyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await services.UpdateProperty(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Property with ID {id} not found." });

            return Ok(updated);
        }

          [HttpDelete("{id:int}")]//Delete
        public async Task<IActionResult> DeleteProperty(int id)
        {
            var success = await services.DeleteProperty(id);
            if (!success)
                return NotFound(new { message = $"Property with ID {id} not found." });

            return NoContent();
        }
} 
}