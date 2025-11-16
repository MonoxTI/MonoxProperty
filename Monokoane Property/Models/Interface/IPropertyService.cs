using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IPropertyService
    {
        Task<IEnumerable<PropertyDto>> GetAllProperties();
        //Task<PropertyDto?> GetPropertyById(int id);
        Task<PropertyDto?> GetPropertyByName(string PropertyName);
        Task<PropertyDto> AddProperty(PropertyDto dto);
        Task<PropertyDto?> UpdateProperty(string PropertyName, PropertyDto dto);
        Task<bool> DeleteProperty(string PropertyName);//#
    }
}

//business logic