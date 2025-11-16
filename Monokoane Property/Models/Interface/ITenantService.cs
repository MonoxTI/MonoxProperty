using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface ITenantService
    {
         Task<IEnumerable<TenantDto>> GetAllTenant();
        Task<TenantDto?> GetTenant(int Id);
        Task<TenantDto> AddTenant(TenantDto dto);
        Task<TenantDto?> UpdateTenant(int Id, TenantDto dto);
        Task<bool> DeleteTenant(int Id);
    }
}

//business logic