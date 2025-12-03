using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{
    public interface ITenantRepo
    {
        Task<IEnumerable<Tenant>> GetAllAsync();
        Task<Tenant?> GetbyEmail(string Email);
        Task<Tenant?> GetIdAsync(int id);
        Task<Tenant> AddAsync(Tenant tenant);
        Task<Tenant> UpdateAsync(int id, Tenant tenant);
        Task DeleteAsync(int id);
    }
}