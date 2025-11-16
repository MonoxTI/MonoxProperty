using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Mapping;

namespace MonoxProperty.Services
{
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

        public async Task<LeaseDto?> GetLeasebyId(int id)
        {
            var leases = await _repo.GetIdAsync(id);
            if(leases == null)
            {
                return null;
            }
            return _mapper.Map<LeaseDto>(leases);
        }

        public async Task<LeaseDto> AddLease (LeaseDto dto)
        {
            var leases = _mapper.Map<Lease>(dto);
            var newlease = await _repo.AddAsync(leases);
            return _mapper.Map<LeaseDto>(newlease);
        }

        public async Task<LeaseDto?> UpdateLease(int id, LeaseDto dto)
        {
            var existing = await _repo.GetIdAsync(id);
            if(existing == null)
            {
                return null;
            }
            _mapper.Map(dto, existing);
            var update = await _repo.UpdateAsync(id, existing);
            return _mapper.Map<LeaseDto>(update);
        }

        public async Task<bool> DeleteLease(int id)
        {
            var leases = await _repo.GetIdAsync(id);
            if(leases == null)
            {
                return null;
            }
            await _repo.DeleteAsync(id);
            return true;
        }
    }
}