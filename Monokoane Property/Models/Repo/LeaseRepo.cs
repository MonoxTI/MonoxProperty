using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using Microsoft.EntityFrameworkCore;

namespace MonoxProperty.Repository
{
    public class LeaseRepo : ILeaseRepo
    {
        private readonly ApplicationDB _context;

        public LeaseRepo(ApplicationDB context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Lease>> GetAllAsync()
        {
            return await _context.Leases
                .ToListAsync();
        }

        public async Task<Lease?> GetIdAsync(int id)
        {
            return await _context.Leases
            .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Lease> AddAsync(Lease lease)
        {
            _context.Leases.Add(lease);
            await _context.SaveChangesAsync();
            return lease;
        }

        public async Task<Lease> UpdateAsync(int id, Lease lease)
        {
            _context.Leases.Update(lease);
            await _context.SaveChangesAsync();
            return lease;
        }

        public async Task DeleteAsync(int id)
        {
            var lease = await _context.Leases
            .FirstOrDefaultAsync(p => p.Id == id);
            if(lease != null)
            {
                _context.Leases.Remove(lease);
                await _context.SaveChangesAsync();
            }
        }
    }
}
