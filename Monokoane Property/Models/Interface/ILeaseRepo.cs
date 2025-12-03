using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{
    public interface ILeaseRepo
    {
        Task<IEnumerable<Lease>> GetAllAsync();
        Task<Lease?> GetIdAsync(int Id);
        Task<Lease?> Getby(int PropertyId);
        Task<Lease> AddAsync(Lease lease);
        Task<Lease> UpdateAsync(int Id, Lease lease);
        Task DeleteAsync(int Id);
    }
}