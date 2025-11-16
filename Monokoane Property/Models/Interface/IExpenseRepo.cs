using MonoxProperty.Entities;

namespace MonoxProperty.Interface
{
    public interface IExpenseRepo
    {
        Task<IEnumerable<Expense>> GetAllAsync();
        Task<Lease?> GetIdAsync(int id);
        Task<Lease> AddAsync(Expense expense);
        Task<Lease> UpdateAsync(Expense expense);
        Task DeleteAsync(int id);
    }
}