using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;

namespace MonoxProperty.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepo _repo;
        private readonly IMapper _mapper;

        public ExpenseService(IExpenseRepo repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        // Get all leases
        public async Task<IEnumerable<ExpenseDto>> GetAllExpense()
        {
            var expenses = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<ExpenseDto?> GetExpensebyId(int id)
        {
            var expenses = await _repo.GetIdAsync(id);
            if(expenses == null)
            {
                return null;
            }
            return _mapper.Map<ExpenseDto>(expenses);
        }

        public async Task<ExpenseDto> AddExpense (ExpenseDto dto)
        {
            var expenses = _mapper.Map<Expense>(dto);
            var newexpense = await _repo.AddAsync(expenses);
            return _mapper.Map<ExpenseDto>(newexpense);
        }

        public async Task<ExpenseDto?> UpdateExpense(int id, ExpenseDto dto)
        {
            var expenses = await _repo.GetIdAsync(id);
            if(expenses == null)
            {
                return null;
            }
            _mapper.Map(dto, expenses);
            var update = await _repo.UpdateAsync(id, expenses);
            return _mapper.Map<ExpenseDto>(update);
        }

        public async Task<bool> DeleteExpense(int id)
        {
            var Expenses = await _repo.GetIdAsync(id);
            if(Expenses == null)
            {
                return null;
            }
            await _repo.DeleteAsync(id);
            return true;
        }
    }
}