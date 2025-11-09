using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interface;
using AutoMapper;


namespace MonoxProperty.Controllers
{   
[ApiController]
[Route("api/property")]
public class PropertyController : ControllerBase
{
    private readonly IPropertyService service;

    public PropertyController(IPropertyService propService)
    {
        services = propService;
    }

    [HttpPost]//adding
    public async Task<IActionResult> AddProperty([FromBody] PropertyDto propertyDto)
    {
        if (!ModelState.isvalid)
            return BadRequest(ModelState);

        var created = await services.AddPropertyAsync(propertyDto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet]// GetAll
    public async Task<IActionResult> GetProperties()
    {
        var properties = await services.GetAllProperties();
        return Ok(properties);
    }

    [HttpGet("{id:int}")]//get by id
    public async Task<IActionResult> GetPropid(int id)
    {
        var property = await services.GetPropertyByIdAsync(id);
        if(property == null)
        return NotFound(new {message = $"Property with ID:{id} not found"});

        return Ok(property);
    }


    [HttpPut("{id:int}")]//updating
     public async Task<IActionResult> Update(int id, [FromBody] PropertyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await services.UpdatePropertyAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Property with ID {id} not found." });

            return Ok(updated);
        }

          [HttpDelete("{id:int}")]//Delete
        public async Task<IActionResult> Delete(int id)
        {
            var success = await services.DeletePropertyAsync(id);
            if (!success)
                return NotFound(new { message = $"Property with ID {id} not found." });

            return NoContent();
        }
} 
}