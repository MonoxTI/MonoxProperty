using MonoxProperty.Entities;

namespace MonoxProperty.Interface
{
    public interface ILeaseRepo
    {
        Task<IEnumerable<Lease>> GetAllAsync();
        Task<Lease?> GetIdAsync(int Id);
        Task<Lease> AddAsync(Lease lease);
        Task<Lease> UpdateAsync(Lease lease);
        Task DeleteAsync(int id);
    }
}