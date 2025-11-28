using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;

namespace MonoxProperty.Services
{
     public class DuplicateleaseException : Exception
    {
        public DuplicateleaseException(int Id) 
        : base($"Tenant with ID '{Id}' already exists.")
        {

        }
    }
    public class LeaseService : ILeaseService
    {
        private readonly ILeaseRepo _repo;
        private readonly IMapper _mapper;

        public LeaseService(ILeaseRepo repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        // Get all leases
        public async Task<IEnumerable<LeaseDto>> GetAllLeases()
        {
            var leases = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<LeaseDto>>(leases);
        }

        public async Task<LeaseDto?> GetLeasebyId(int Id)
        {
            var leases = await _repo.GetIdAsync(Id);
            if(leases == null)
            {
                return null;
            }
            return _mapper.Map<LeaseDto>(leases);
        }

        public async Task<LeaseDto> AddLease (LeaseDto dto)
        {
            if(dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }
            var existing = await _repo.GetIdAsync(dto.Id);
            if(existing != null)
            {
                throw new DuplicateleaseException(dto.Id);
            }
            var leases = _mapper.Map<Lease>(dto);
            var newlease = await _repo.AddAsync(leases);
            return _mapper.Map<LeaseDto>(newlease);
        }

        public async Task<LeaseDto?> UpdateLease(int Id, LeaseDto dto)
        {
            var existing = await _repo.GetIdAsync(Id);
            if(existing == null)
            {
                return null;
            }
            _mapper.Map(dto, existing);
            var update = await _repo.UpdateAsync(Id, existing);
            return _mapper.Map<LeaseDto>(update);
        }

        public async Task<bool> DeleteLease(int Id)
        {
            var leases = await _repo.GetIdAsync(Id);
            if(leases == null)
            {
                return false;
            }
            await _repo.DeleteAsync(Id);
            return true;
        }
    }
}