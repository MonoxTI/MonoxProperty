using MonoxProperty.Dtos;
using AutoMapper;
using MonoxProperty.Entities;

namespace MonoxProperty.Mapping
{   
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap< Property, PropertyDto >().ReverseMap();
        //CreateMap< Property, OnePropertyDto >().ReverseMap();
        CreateMap< Tenant, TenantDto >().ReverseMap();
        CreateMap< Lease, LeaseDto >().ReverseMap();
        CreateMap< Expense, ExpenseDto >().ReverseMap();
    }
}
}