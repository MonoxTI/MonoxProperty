using MonoxProperty.Entities;

namespace MonoxProperty.Interface
{
    public interface ITenantRepo
    {
        Task<IEnumerable<Tenant>> GetAllAsync();
        Task<Tenant?> GetIdAsync(int id);
        Task<Tenant> AddAsync(Tenant tenant);
        Task<Tenant> UpdateAsync(Tenant tenant);
        Task DeleteAsync(int id);
    }
}