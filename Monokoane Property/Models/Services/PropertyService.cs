using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;

namespace MonoxProperty.Services
{
    public class PropertyService : IPropertyRepo
    {
        private readonly IPropertyRepo _propertyRepo;
        private readonly IMapper _mapper;

        public PropertyService(IPropertyRepo propertyRepo, IMapper mapper)
        {
            _propertyRepo = propertyRepo;
            _mapper = mapper;
        }

        // Get all properties
        public async Task<IEnumerable<PropertyDto>> GetProperties()
        {
            var properties = await _propertyRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<PropertyDto>>(properties);
        }

        // Get property by ID
        public async Task<PropertyDto?> GetPropertyById(int id)
        {
            var property = await _propertyRepo.GetIdAsync(id);
            if (property == null)
                return null;
                
            return _mapper.Map<PropertyDto>(property);
        }

        // Add new property
        public async Task<PropertyDto> AddProperty(PropertyDto dto)
        {
            var property = _mapper.Map<Property>(dto);
            var newProperty = await _propertyRepo.AddAsync(property);
            return _mapper.Map<PropertyDto>(newProperty);
        }

        // Update property
        public async Task<PropertyDto?> UpdateProperty(int id, PropertyDto dto)
        {
            var existing = await _propertyRepo.GetIdAsync(id);
            if (existing == null)
                return null;

            _mapper.Map(dto, existing);
            var updated = await _propertyRepo.UpdateAsync(existing);
            return _mapper.Map<PropertyDto>(updated);
        }

        // Delete property
        public async Task<bool> DeletePropertyAsync(int id)
        {
            var property = await _propertyRepo.GetIdAsync(id);
            if (property == null)
                return false;

            await _propertyRepo.DeleteAsync(id);
            return true;
        }
    }
}
