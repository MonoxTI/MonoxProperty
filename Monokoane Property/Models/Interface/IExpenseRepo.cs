using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{
    public interface IExpenseRepo
    {
        Task<Expense?> GetIdAsync(int id);
        Task<Expense?> Getby(int PropertyId);
        Task<Expense> AddAsync(Expense expense);
        Task<Expense> UpdateAsync(int id, Expense expense);
        Task DeleteAsync(int id);
    }
}