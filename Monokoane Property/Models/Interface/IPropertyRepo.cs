using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{

public interface IPropertyRepo
{
    Task<IEnumerable<Property>> GetAllAsync();// get all property
    Task<Property?> GetIdAsync(int Id); // get property by id
    Task<Property> AddAsync(Property property); // add property
    Task<Property> UpdateAsync(int id, Property property); // update property
    Task DeleteAsync(int id); // delete property
}
}
//Talks directly to Database