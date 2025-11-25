using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping;
using AutoMapper;


namespace MonoxProperty.Controllers
{   
[ApiController]
[Route("api/expense")]
public class ExpenseController : ControllerBase
{
    private readonly IExpenseService services;
    public ExpenseController(IExpenseService ExpenseService)
    {
        services = ExpenseService;
    }

    [HttpGet]
    public aync Task<IActionResult> GetExpensebyId ([FromBody] ExpenseDto data )
    {
        try
        {
            int id = data.Id;
            if(id <= 0)
            {
                return BadRequest(new {message = "Expense ID required."});
            }
            var expense = await services.GetExpensebyId(id);
            if(expense == null)
            return NotFound(new {message= $"{expense} not found "});

            return ok(expense);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }
    [HttpPost ("add")]
    public async Task<IActionResult> AddExpense([FromBody] ExpenseDto data)
    {
        try
        {
            int expenseId = data.Id;
            if(propertyId <= 0 || data == null)
            {
                return BadRequest(new { message = "Valid PropertyId is required" });
            }
            var expense = await services.AddExpense(data);
            return CreatedAtAction(nameof(GetExpensebyId), 
            new { id = expense.Id }, 
            expense);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }
    [HttpPut("update")]
    public async Task<IActionResult> UpdateExpense([FromBody] ExpenseDto data)
    {
        try
        {
            int id = data.Id;
            if(id <= 0 || data == null)
            {
                return BadRequest(new { message = "Valid Expense ID is required" });
            }
            var updatedExpense = await services.UpdateExpense(id, data);
            if(updatedExpense == null)
            {
                return NotFound(new { message = $"Expense with ID {id} not found." });
            }
            return Ok(updatedExpense);
        }
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }
    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteExpense([FromBody] ExpenseDto data)
    {
        try
        {
            int id = data.Id;
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
        catch(Exception ex)
        {
            return StatusCode(500, new { message = "An error while processing your request.", details = ex.Message});
        }
    }
}
}