using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{

public interface IPropertyRepo
{
    Task<IEnumerable<Property>> GetAllAsync();// get all property
    //Task<Property?> GetIdAsync(int Id); // get property by id
    Task<Property?> GetByName(string propertyName); // get property by name
    Task<Property> AddAsync(Property property); // add property
    Task<Property> UpdateAsync(string name, Property property); // update property
    Task DeleteAsync(string name); // delete property
}
}
//Talks directly to Database