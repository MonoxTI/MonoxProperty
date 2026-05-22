# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ["Monokoane Property.csproj", "./"]
RUN dotnet restore "Monokoane Property.csproj"

COPY . .
RUN dotnet build "Monokoane Property.csproj" -c Release -o /app/build
RUN dotnet publish "Monokoane Property.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

# ✅ Tell ASP.NET to listen on port 80 so Azure App Service can reach it
ENV ASPNETCORE_URLS=http://+:80

EXPOSE 80

ENTRYPOINT ["dotnet", "Monokoane Property.dll"]