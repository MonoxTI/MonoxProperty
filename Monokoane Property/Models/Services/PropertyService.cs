using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;

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

        // Get property by ID
        public async Task<PropertyDto?> GetPropertyById(int id)
        {
            var property = await _repo.GetIdAsync(id);
            if (property == null)
                return null;

            return _mapper.Map<PropertyDto>(property);
        }

        // Add new property
        public async Task<PropertyDto> AddProperty(PropertyDto dto)
        {
            var property = _mapper.Map<Property>(dto);
            var newProperty = await _repo.AddAsync(property);
            return _mapper.Map<PropertyDto>(newProperty);
        }

        // Update property
        public async Task<PropertyDto?> UpdateProperty(int id, PropertyDto dto)
        {
            var existing = await _repo.GetIdAsync(id);
            if (existing == null)
                return null;

            _mapper.Map(dto, existing);
            var updated = await _repo.UpdateAsync(id, existing);
            return _mapper.Map<PropertyDto>(updated);
        }

        // Delete property
        public async Task<bool> DeleteProperty(int id)
        {
            var property = await _repo.GetIdAsync(id);
            if (property == null)
                return false;

            await _repo.DeleteAsync(id);
            return true;
        }
    }
}
