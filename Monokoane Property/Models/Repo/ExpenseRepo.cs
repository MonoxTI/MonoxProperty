using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using Microsoft.EntityFrameworkCore;

namespace MonoxProperty.Repository
{
    public class ExpenseRepo : IExpenseRepo
    {
        private readonly ApplicationDB _context;

        public ExpenseRepo(ApplicationDB context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Expense>> GetAllAsync()
        {
            return await _context.Expenses
                .ToListAsync();
        }

        public async Task<Expense?> GetIdAsync(int Id)
        {
            return await _context.Expenses
            .FirstOrDefaultAsync();
        }

        public async Task<Expense> AddAsync(Expense expense)
        {
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task<Expense> UpdateAsync(Expense expense)
        {
            _context.Expenses.Update(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task DeleteAsync(int id)
        {
            var expense = await _context.Expenses
            .FirstOrDefaultAsync(p => p.id == id);
            if(expense != null)
            {
                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();
            }
        }
    }
}
