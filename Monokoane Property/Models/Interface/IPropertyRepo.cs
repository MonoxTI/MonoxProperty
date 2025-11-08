using MonoxProperty.Entities;

namespace MonoxProperty.Interface
{

public interface IPropertyRepo
{
    Task<IEnumerable<Property>> GetAllAsync();// get all property
    Task<Property?> GetIdAsync(int Id); // get property by id
    Task<Property> AddAsync(Property property); // add property
    Task<Property> UpdateAsync(Property property); // update property
    Task DeleteAsync(int id); // delete property
}
}