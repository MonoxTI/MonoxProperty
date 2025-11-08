using MonoxProperty.Entities;

namespace MonoxProperty.Interface
{
    public interface ITenantRepo
    {
        Task<IEnumerable<Tenant>> GetAllAsync();
        Task<Tenant?> GetIdAsync(int Id);
        Task<Tenant> AddAsync(Tenant tenant);
        Task<Tenant> UpdateAsync(Tenant tenant);
        Task DeleteAsync(int id);
    }
}