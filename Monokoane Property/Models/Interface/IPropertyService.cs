using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IPropertyService
    {
        Task<IEnumerable<PropertyDto>> GetAllProperties();
        //Task<PropertyDto?> GetPropertyById(int id);
        Task<PropertyDto?> GetPropertyByName(string name);
        Task<PropertyDto> AddProperty(PropertyDto dto);
        Task<PropertyDto?> UpdateProperty(string name, PropertyDto dto);
        Task<bool> DeleteProperty(string name);
    }
}

//business logic