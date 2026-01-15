using MonoxProperty.Dtos;
using System.Collections.Generic; 
using System.Threading.Tasks;

namespace MonoxProperty.Interfaces
{
    public interface IExpenseService
    {
        Task<IEnumerable<ExpenseDto>> GetAllExpenses();
        Task<ExpenseDto?> GetExpensebyId(int id);
        Task<ExpenseDto> AddExpense(ExpenseDto dto);
        Task<bool> DeleteExpense(int id);
    }
}