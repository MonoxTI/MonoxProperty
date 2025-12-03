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

        public async Task<Expense?> GetIdAsync(int id)
        {
            return await _context.Expenses
            .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Expense?> Getby(int PropertyId)
        {
            return await _context.Expenses
            .FirstOrDefaultAsync(p => p.PropertyId == PropertyId);
        }

        public async Task<Expense> AddAsync(Expense expense)
        {
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task<Expense> UpdateAsync(int id, Expense expense)
        {
            _context.Expenses.Update(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task DeleteAsync(int id)
        {
            var expense = await _context.Expenses
            .FirstOrDefaultAsync(p => p.Id == id);
            if(expense != null)
            {
                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();
            }
        }
    }
}
