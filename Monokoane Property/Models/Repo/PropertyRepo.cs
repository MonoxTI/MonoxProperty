using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using Microsoft.EntityFrameworkCore;

namespace MonoxProperty.Repository
{
    public class PropertyRepo : IPropertyRepo
    {
        private readonly ApplicationDB _context;

        public PropertyRepo(ApplicationDB context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Property>> GetAllAsync()
        {
            return await _context.Properties
                .ToListAsync();
        }

        public async Task<Property?> GetByName(string propertyName)
        {
            return await _context.Properties
                .Include(p => p.Expenses)
                .Include(p => p.Leases)
                .ThenInclude(l => l.Tenant)
                .FirstOrDefaultAsync(p => p.PropertyName.ToLower() == propertyName.ToLower());
        }
      
        public async Task<Property> AddAsync(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<Property?> UpdateAsync(string PropertyName, Property property)
        {
            var existing = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyName.ToLower() == PropertyName.ToLower());
                if(existing == null)
                {
                    return null;
                }
            _context.Properties.Update(property);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(string PropertyName)
        {
            var property = await _context.Properties
            .FirstOrDefaultAsync(p => p.PropertyName != null && p.PropertyName.ToLower() == PropertyName.ToLower());
            if (property != null)
            {
                _context.Properties.Remove(property);
                await _context.SaveChangesAsync();
            }
        }
    }
}
