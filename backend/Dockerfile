# Use the official .NET 8 runtime as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore as distinct layers
COPY ["src/CNCTaskManagement.Api/CNCTaskManagement.Api.csproj", "src/CNCTaskManagement.Api/"]
COPY ["src/CNCTaskManagement.Core/CNCTaskManagement.Core.csproj", "src/CNCTaskManagement.Core/"]
COPY ["src/CNCTaskManagement.Infrastructure/CNCTaskManagement.Infrastructure.csproj", "src/CNCTaskManagement.Infrastructure/"]
COPY ["src/CNCTaskManagement.Shared/CNCTaskManagement.Shared.csproj", "src/CNCTaskManagement.Shared/"]
RUN dotnet restore "src/CNCTaskManagement.Api/CNCTaskManagement.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/src/CNCTaskManagement.Api"
RUN dotnet build "CNCTaskManagement.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CNCTaskManagement.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variable to listen on all interfaces
ENV ASPNETCORE_URLS=http://+:80

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "CNCTaskManagement.Api.dll"]