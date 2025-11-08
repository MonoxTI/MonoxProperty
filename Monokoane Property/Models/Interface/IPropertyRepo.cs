using MonoxProperty.Entities;

namespace MonoxProperty.Interface
{

public interface IPropertyRepo
{
    Task<IEnumerable<Property>> GetAllAsync();
    Task<Property?> GetIdAsync(int Id);
    Task<Property> AddAsync(Property property);
    Task<Property> UpdateAsync(Property property);
    Task DeleteAsync(int id);
}
}