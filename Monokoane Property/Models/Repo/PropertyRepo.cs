using MonoxProperty.Entities;
using MonoxProperty.Interface;
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
                .Include(p => p.Expenses)
                .ToListAsync();
        }

        public async Task<Property?> GetIdAsync(int id)
        {
            return await _context.Properties
                .Include(p => p.Expenses)
                .FirstOrDefaultAsync(p => p.ID == id);
        }

        public async Task<Property> AddAsync(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<Property> UpdateAsync(Property property)
        {
            _context.Properties.Update(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task DeleteAsync(int id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property != null)
            {
                _context.Properties.Remove(property);
                await _context.SaveChangesAsync();
            }
        }
    }
}
