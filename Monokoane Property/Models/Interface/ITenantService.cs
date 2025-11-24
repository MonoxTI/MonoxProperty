using MonoxProperty.Dtos;

namespace MonoxProperty.Interfaces
{
    public interface ITenantService
    {
         Task<IEnumerable<TenantDto>> GetAllTenant();
        Task<TenantDto?> GetTenant(int id);
        Task<TenantDto> AddTenant(TenantDto dto);
        Task<TenantDto?> UpdateTenant(int id, TenantDto dto);
        Task<bool> DeleteTenant(int id);
    }
}

//business logic