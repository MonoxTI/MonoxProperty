using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;
using MonoxProperty.Exceptions;

namespace MonoxProperty.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IPropertyRepo _repo;
        private readonly IMapper _mapper;

        public PropertyService(IPropertyRepo repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        // Get all properties
        public async Task<IEnumerable<PropertyDto>> GetAllProperties()
        {
            var properties = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<PropertyDto>>(properties);
        }

        // Get property by name
        //# ?
        public async Task<PropertyDto?> GetPropertyByName(string PropertyName)
        {
            var property = await _repo.GetByName(PropertyName);
            if (property == null)
            {
                return null;
            }
            return _mapper.Map<PropertyDto>(property);//#
        }

        // Add new property
        public async Task<PropertyDto> AddProperty(PropertyDto dto)
       {
        if (dto == null)
        throw new ArgumentNullException(nameof(dto));

        if(dto.Apartments && dto.Units <= 0)
        {
            throw new ArgumentException("Units must be greater than zero for apartment properties.", nameof(dto.Units));
        }
        else if (!dto.Apartments && dto.Units != 1)
        {
            throw new ArgumentException("Non-apartment properties.");
        }

        var propertyName = dto.PropertyName?.Trim();
        if (string.IsNullOrWhiteSpace(propertyName))
        throw new ArgumentException("Property name is required.", nameof(dto.PropertyName));
        
        var existing = await _repo.GetByName(propertyName);
        if (existing != null)
        throw new DuplicateEntityException(propertyName);
        
        var property = _mapper.Map<Property>(dto);
        property.PropertyName = propertyName; // Ensure normalized name is saved
        var newProperty = await _repo.AddAsync(property);
        return _mapper.Map<PropertyDto>(newProperty);
        }
       
        
        // Update property
        //# Task<>
        public async Task<PropertyDto?> UpdateProperty(string PropertyName, PropertyDto dto)
        {
            var existing = await _repo.GetByName(PropertyName);
            if (existing == null)
            {
                return null;
            }
            _mapper.Map(dto, existing);//#
            var updated = await _repo.UpdateAsync(PropertyName, existing);
            return _mapper.Map<PropertyDto>(updated);
        }

        // Delete property
        public async Task<bool> DeleteProperty(string PropertyName)
        {
            var property = await _repo.GetByName(PropertyName);
            if (property == null)
                return false;

            await _repo.DeleteAsync(PropertyName);
            return true;
        }
    }
}
