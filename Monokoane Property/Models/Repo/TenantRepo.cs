using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using Microsoft.EntityFrameworkCore;

namespace MonoxProperty.Repository
{
    public class TenantRepo : ITenantRepo
    {
        private readonly ApplicationDB _context;

        public TenantRepo(ApplicationDB context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tenant>> GetAllAsync()
         {
            return await _context.Tenants
                .ToListAsync();
        }

        public async Task<Tenant?> GetIdAsync(int id)
        {
            return await _context.Tenants
            .FirstOrDefaultAsync(p => p.ID == id);
        }

        public async Task<Tenant> AddAsync(Tenant tenant)
        {
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();
            return tenant;
        }

        public async Task<Tenant> UpdateAsync(int id, Tenant tenant)
        {
            _context.Tenants.Update(tenant);
            await _context.SaveChangesAsync();
            return tenant;
        }

        public async Task DeleteAsync(int id)
        {
            var tenant = await _context.Tenants
            .FirstOrDefaultAsync(p => p.Id == id);
            if(tenant != null)
            {
                _context.Tenants.Remove(tenant);
                await _context.SaveChangesAsync();
            }
        }
    }
}
