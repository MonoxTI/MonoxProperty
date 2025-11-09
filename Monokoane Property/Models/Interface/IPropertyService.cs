using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IPropertyService
    {
        Task<IEnumerable<PropertyDto>> GetAllProperties();
        Task<PropertyDto?> GetPropertyById(int id);
        Task<PropertyDto> AddProperty(PropertyDto dto);
        Task<PropertyDto?> UpdateProperty(int id, PropertyDto dto);
        Task<bool> DeleteProperty(int id);
    }
}

//business logic