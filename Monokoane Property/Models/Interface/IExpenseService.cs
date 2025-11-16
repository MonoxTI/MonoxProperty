using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface IExpenseService
    {
        Task<IEnumerable<ExpenseDto>> GetAllExpense();
        Task<ExpenseDto?> GetExpensebyId(int Id);
        Task<ExpenseDto> AddExpense(ExpenseDto dto);
        Task<ExpenseDto?> UpdateExpense(int Id, ExpenseDto dto);
        Task<bool> DeleteExpense(int Id);
    }
}