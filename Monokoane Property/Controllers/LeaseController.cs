using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace MonoxProperty.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/lease")]
    public class LeaseController : ControllerBase
    {
        private readonly ILeaseService _service;

        public LeaseController(ILeaseService leaseService)
        {
            _service = leaseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaseDto>>> GetLeases()
        {
            var leases = await _service.GetAllLeases();
            return Ok(leases);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<LeaseDto>> GetLeaseById(int id)
        {
            if (id <= 0)
                return BadRequest("Lease ID must be greater than 0.");

            var lease = await _service.GetLeaseById(id);
            if (lease == null)
                return NotFound($"Lease with id {id} not found.");

            return Ok(lease);
        }

        [HttpPost("add")]
        public async Task<ActionResult<LeaseDto>> AddLease([FromBody] LeaseDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var addedLease = await _service.AddLease(dto);
                return CreatedAtAction(
                    nameof(GetLeaseById),
                    new { id = addedLease.Id },
                    addedLease
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")] // ✅ FIXED: Correct route template
        public async Task<ActionResult<LeaseDto>> UpdateLease(int id, [FromBody] LeaseDto dto)
        {
            if (!ModelState.IsValid || id <= 0)
                return BadRequest("Invalid lease data or ID.");

            if (dto.Id != id)
                return BadRequest("Lease ID in URL does not match ID in body.");

            var updatedLease = await _service.UpdateLease(id, dto);
            if (updatedLease == null)
                return NotFound($"Lease with id {id} not found.");

            return Ok(updatedLease);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteLease(int id)
        {
            if (id <= 0)
                return BadRequest("Lease ID must be greater than 0.");

            var deleted = await _service.DeleteLease(id);
            if (!deleted)
                return NotFound($"Lease with id {id} not found.");

            return NoContent(); // ✅ Standard for successful DELETE
        }
    }
}