using MonoxProperty.Models.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IPropertyService
    {
        Task<IEnumerable<PropertyDto>> GetAllProperties();
        Task<PropertyDto?> GetPropertyByIdAsync(int id);
        Task<PropertyDto> AddPropertyAsync(PropertyDto dto);
        Task<PropertyDto?> UpdatePropertyAsync(int id, PropertyDto dto);
        Task<bool> DeletePropertyAsync(int id);
    }
}

//business logic