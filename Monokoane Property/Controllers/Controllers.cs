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
    private readonly IPropertyRepo _repository;
    private readonly IMapper _mapper;

    public PropertyController(IPropertyRepo repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    [HttpPost]//adding
    public async Task<IActionResult> AddProperty([FromBody] PropertyDto propertyDto)
    {
        if (propertyDto == null)
        {
            return BadRequest("Invalid property data");
        }

        var property = _mapper.Map<Property>(propertyDto);
        var created = await _repository.AddAsync(property);
        var resultDto = _mapper.Map<PropertyDto>(created);
        return CreatedAtAction(nameof(GetProperties), new { id = resultDto.Id }, resultDto);
    }

    [HttpGet]// Getting
    public async Task<IActionResult> GetProperties()
    {
        var properties = await _repository.GetAllAsync();
        var dto = _mapper.Map<IEnumerable<PropertyDto>>(properties);
        return Ok(dto);
    }

   // [HttpPatch("{id}")]//updating


   // [HttpDelete("{id}")]//deleting
} 
}