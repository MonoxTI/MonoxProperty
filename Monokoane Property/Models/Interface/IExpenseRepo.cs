using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{
    public interface IExpenseRepo
    {
        Task<Expense?> GetIdAsync(int id);
        Task<IEnumerable<Expense>> GetAllAsync();
        Task<Expense?> Getby(int PropertyId);
        Task<Expense> AddAsync(Expense expense);
        Task DeleteAsync(int id);
    }
}