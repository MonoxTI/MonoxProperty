using MonoxProperty.Dtos;
using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;

namespace MonoxProperty.Mapping
{   
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap< Property, PropertyDto >().ReverseMap();
        CreateMap< Property, CreatePropertyDto >().ReverseMap();
        CreateMap< Tenant, TenantDto >().ReverseMap();
        CreateMap< Lease, LeaseDto >().ReverseMap();
        CreateMap< Expense, ExpenseDto >().ReverseMap();
    }
}
}