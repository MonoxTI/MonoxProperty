using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;

namespace MonoxProperty.Services
{
    public class TenantService : ITenantService
    {
        private readonly ITenantRepo _repo;
        private readonly IMapper _mapper;

        public TenantService(ITenantRepo repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        // Get all properties
        public async Task<IEnumerable<TenantDto>> GetAllTenant()
        {
            var tenants = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<TenantDto>>(tenants);//#
        }

        // Get property by name
        //# ?
        public async Task<TenantDto?> GetTenant(int Id)
        {
            var tenants = await _repo.GetIdAsync(Id);
            if (tenants == null)
            {
                return null;
            }
            return _mapper.Map<TenantDto>(tenants);//#
        }

        // Add new property
        public async Task<TenantDto> AddTenant(TenantDto dto)
        {
            var tenants = _mapper.Map<Tenant>(dto);
            var newTenant = await _repo.AddAsync(tenants);
            return _mapper.Map<TenantDto>(newTenant);
        }
        
        // Update property
        //# Task<>
        public async Task<TenantDto?> UpdateTenant(int Id, TenantDto dto)
        {
            var tenants = await _repo.GetByName(Id);
            if (tenants == null)
            {
                return null;
            }
            _mapper.Map(dto, tenants);//#
            var updated = await _repo.UpdateAsync(Id, tenants);
            return _mapper.Map<TenantDto>(updated);
        }

        // Delete property
        public async Task<bool> DeleteTenant(int Id)
        {
            var tenants = await _repo.GetByName(Id);
            if (tenants == null)
                return false;

            await _repo.DeleteAsync(Id);
            return true;
        }
    }
}
