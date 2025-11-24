using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IExpenseService
    {
        Task<ExpenseDto?> GetExpensebyId(int id);
        Task<ExpenseDto> AddExpense(ExpenseDto dto);
        Task<ExpenseDto?> UpdateExpense(int id, ExpenseDto dto);
        Task<bool> DeleteExpense(int id);
    }
}