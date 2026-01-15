using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;
using MonoxProperty.Exceptions;

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

        public async Task<IEnumerable<ExpenseDto>> GetAllExpenses()
        {
            var expenses = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<ExpenseDto?> GetExpensebyId(int Id)
        {
            var expenses = await _repo.GetIdAsync(Id);
            if(expenses == null)
            {
                return null;
            }
            return _mapper.Map<ExpenseDto>(expenses);
        }

        public async Task<ExpenseDto> AddExpense (ExpenseDto dto)
        {
            if(dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }
            var existing = await _repo.Getby(dto.PropertyId);
            if(existing != null)
            {
                throw new DuplicateEntityException("Expense",dto.PropertyId.ToString());
            }
            var expenses = _mapper.Map<Expense>(dto);
            var newexpense = await _repo.AddAsync(expenses);
            return _mapper.Map<ExpenseDto>(newexpense);
        }

        public async Task<bool> DeleteExpense(int Id)
        {
            var Expenses = await _repo.GetIdAsync(Id);
            if(Expenses == null)
            {
                return false;
            }
            await _repo.DeleteAsync(Id);
            return true;
        }
    }
}