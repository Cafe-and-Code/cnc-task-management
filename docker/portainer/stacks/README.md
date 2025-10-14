# CNC Task Management System - Portainer Deployment

This directory contains the necessary configuration files to deploy the CNC Task Management System using Portainer.

## Prerequisites

1. Docker and Docker Compose installed
2. Portainer running on your Docker host
3. SSL certificates for your domain (located in `./ssl/` directory)
4. Environment variables configured in `.env` file

## Deployment Steps

### 1. Set Up Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Edit the `.env` file and update the following values:

- `DB_PASSWORD`: Secure password for the PostgreSQL database
- `REDIS_PASSWORD`: Secure password for Redis
- `JWT_SECRET`: Secure secret key for JWT tokens (at least 32 characters)
- `JWT_ISSUER`: Issuer for JWT tokens (default: "CNC Task Management")
- `JWT_AUDIENCE`: Audience for JWT tokens (default: "CNC Task Management Users")
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `ENCRYPTION_KEY`: 32-byte encryption key for sensitive data
- `ENCRYPTION_IV`: 16-byte initialization vector for encryption

### 2. Set Up SSL Certificates

Place your SSL certificates in the `./ssl/` directory:

- `cnctaskmanagement.com.crt`: SSL certificate file
- `cnctaskmanagement.com.key`: SSL private key file

### 3. Create Docker Network

Create the external Docker network before deploying:

```bash
docker network create cnc-network
```

### 4. Deploy with Portainer

1. Log in to your Portainer instance
2. Navigate to "Stacks" in the left menu
3. Click "Add stack"
4. Give the stack a name (e.g., "cnc-task-management")
5. Copy the contents of `cnc-task-management.yml` into the Web editor
6. Click "Deploy the stack"

### 5. Set Up Portainer

Deploy Portainer itself using the provided configuration:

```bash
cd docker/portainer
docker-compose up -d
```

Access Portainer at `https://your-server:9443` and complete the initial setup.

## Architecture

The deployment consists of the following services:

- **Database**: PostgreSQL 15 for data persistence
- **Redis**: In-memory cache for session storage and caching
- **Backend**: ASP.NET Core API server
- **Frontend**: React application served by Nginx
- **Nginx**: Reverse proxy with SSL termination and rate limiting

## Security Configuration

The Nginx configuration includes:

- SSL/TLS encryption with modern cipher suites
- HTTP to HTTPS redirection
- Security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting for API endpoints
- CORS configuration for cross-origin requests
- WebSocket proxy configuration for SignalR

## Monitoring and Maintenance

### Logs

View logs for each service in Portainer:

1. Navigate to "Containers"
2. Click on the container you want to inspect
3. Go to the "Logs" tab

### Backups

Regularly back up:

1. Database: `docker exec cnc-database pg_dump -U cnc_admin CNCTaskManagement > backup.sql`
2. Uploaded files: Backup the `app_uploads` volume
3. Portainer data: Backup the `portainer_data` volume

### Updates

To update the application:

1. Build and push new Docker images
2. In Portainer, update the stack with the new image versions
3. Click "Update the stack"

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check that the database is running: `docker ps | grep cnc-database`
   - Verify connection string in environment variables

2. **SSL Certificate Issues**
   - Ensure certificates are in the correct location
   - Verify certificate validity

3. **Rate Limiting Issues**
   - Adjust rate limiting rules in `nginx.conf`
   - Check logs for rate limiting violations

### Container Status

Check the status of all containers:

```bash
docker ps -a | grep cnc-
```

### Network Issues

Verify that all containers are on the same network:

```bash
docker network inspect cnc-network
```

## Performance Optimization

### Database Optimization

1. Regularly vacuum and analyze the PostgreSQL database
2. Monitor slow queries and add indexes as needed
3. Consider read replicas for high-traffic deployments

### Caching Strategy

1. Utilize Redis for session storage and application caching
2. Implement API response caching where appropriate
3. Use Nginx caching for static assets

### Scaling

To scale the application:

1. Increase the number of backend containers
2. Consider container orchestration with Docker Swarm or Kubernetes
3. Implement load balancing for multiple backend instances

## Security Considerations

1. Regularly update all Docker images
2. Use secrets management for sensitive data
3. Implement network segmentation if needed
4. Monitor for security vulnerabilities
5. Regularly rotate secrets and passwords