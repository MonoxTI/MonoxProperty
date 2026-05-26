using MonoxProperty.Dtos;
using AutoMapper;
using MonoxProperty.Entities;

namespace MonoxProperty.Mapping
{   
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Property, PropertyDto>()
        .ForMember(dest => dest.Units, opt => opt.MapFrom(src => src.UnitsList.Count > 0 ? src.UnitsList.Count : src.Units))
        .ReverseMap();
        CreateMap< Tenant, TenantDto >().ReverseMap();
        CreateMap< Lease, LeaseDto >().ReverseMap();
        CreateMap< Expense, ExpenseDto >().ReverseMap();
    }
}
}