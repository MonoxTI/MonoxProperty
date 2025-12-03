using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping;
using MonoxProperty.Exceptions;
using AutoMapper;


namespace MonoxProperty.Controllers
{   
[Authorize]
[ApiController]
[Route("api/expense")]
public class ExpenseController : ControllerBase
{
    private readonly IExpenseService services;
    public ExpenseController(IExpenseService ExpenseService)
    {
        services = ExpenseService;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ExpenseDto>> GetExpensebyId ( int id)
    {
            if(id <= 0 )
            {
                return BadRequest("Expense ID required.");
            }
            var expense = await services.GetExpensebyId(id);
            if(expense == null)
            return NotFound(new {message= $"Expense with ID {id} not found "});

            return Ok(expense);
    }
    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> AddExpense([FromBody] ExpenseDto data)
    {
        try
        {
            if( data == null)
            {
                return BadRequest(new { message = "Valid PropertyId is required" });
            }
            if(data.Amount <= 0)
            {
                return BadRequest(new { message = "Amount must be greater than zero." });
            }

            var expense = await services.AddExpense(data);
            return CreatedAtAction(nameof(GetExpensebyId), 
            new { id = expense.Id }, 
            expense);
        }catch(DuplicateEntityException ex)
        {
            return BadRequest(new { message = ex.Message });
        }catch(ArgumentException ex)
        {
            return BadRequest(new {message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, [FromBody] ExpenseDto data)
    {
            if(id <= 0 || data == null)
            {
                return BadRequest(new { message = "Valid Expense ID is required" });
            }
            if(data.Id != id)
            {
                return BadRequest("Expense ID mismatch between URL and body." );
            }
            var updatedExpense = await services.UpdateExpense(id, data);
            if(updatedExpense == null)
            {
                return NotFound(new { message = $"Expense with ID {id} not found." });
            }
            return Ok(updatedExpense);
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteExpense(int id)
    {
            if(id <= 0)
            {
                return BadRequest(new { message = "Valid Expense ID is required" });
            }
            var isDeleted = await services.DeleteExpense(id);
            if(!isDeleted)
            {
                return NotFound(new { message = $"Expense with ID {id} not found." });
            }
            return Ok(new { message = "Expense deleted successfully." });
    }
}
}