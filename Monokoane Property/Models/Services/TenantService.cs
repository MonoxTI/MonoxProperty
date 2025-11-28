using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;

namespace MonoxProperty.Services
{
    public class DuplicatetenantException : Exception
    {
        public DuplicatetenantException(int Id) 
        : base($"Tenant with ID '{Id}' already exists.")
        {

        }
    }
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
            if(dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }
            var existing = await _repo.GetIdAsync(dto.Id);
            if(existing != null)
            {
                throw new DuplicatetenantException(dto.Id);
            }
            var tenants = _mapper.Map<Tenant>(dto);
            var newTenant = await _repo.AddAsync(tenants);
            return _mapper.Map<TenantDto>(newTenant);
        }
        
        // Update property
        //# Task<>
        public async Task<TenantDto?> UpdateTenant(int id, TenantDto dto)
        {
            var tenants = await _repo.GetIdAsync(id);
            if (tenants == null)
            {
                return null;
            }
            _mapper.Map(dto, tenants);//#
            var updated = await _repo.UpdateAsync(id, tenants);
            return _mapper.Map<TenantDto>(updated);
        }

        // Delete property
        public async Task<bool> DeleteTenant(int id)
        {
            var tenants = await _repo.GetIdAsync(id);
            if (tenants == null)
                return false;

            await _repo.DeleteAsync(id);
            return true;
        }
    }
}
