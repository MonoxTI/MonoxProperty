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

    [HttpGet]
    public async Task<IActionResult> GetProperties()
    {
        var properties = await _repository.GetAllAsync();
        var dto = _mapper.Map<IEnumerable<PropertyDto>>(properties);
        return Ok(dto);
    }
}
}