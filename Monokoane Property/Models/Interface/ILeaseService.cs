using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface ILeaseService
    {
        Task<IEnumerable<LeaseDto>> GetAllLeases();
        Task<LeaseDto?> GetLeasebyId(int Id);
        Task<LeaseDto> AddLease(LeaseDto dto);
        Task<LeaseDto?> UpdateLease(int Id, LeaseDto dto);
        Task<bool> DeleteLease(int Id);
    }
}