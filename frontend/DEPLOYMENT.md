# Deployment Guide

This guide covers deployment options for the CNC Task Management System frontend.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Build Process](#build-process)
3. [Deployment Options](#deployment-options)
4. [Docker Deployment](#docker-deployment)
5. [Static File Hosting](#static-file-hosting)
6. [CDN Configuration](#cdn-configuration)
7. [Environment-Specific Settings](#environment-specific-settings)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Troubleshooting](#troubleshooting)

## Environment Configuration

### Required Environment Variables

Create environment-specific `.env` files:

#### Development (.env.development)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000/hubs

# Application Settings
VITE_APP_NAME=CNC Task Management (Dev)
VITE_APP_VERSION=2.1.0-dev

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=true

# External Services
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

#### Staging (.env.staging)
```env
# API Configuration
VITE_API_URL=https://staging-api.cnc-taskmanager.com/api
VITE_SIGNALR_URL=https://staging-api.cnc-taskmanager.com/hubs

# Application Settings
VITE_APP_NAME=CNC Task Management (Staging)
VITE_APP_VERSION=2.1.0-staging

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false

# External Services
VITE_SENTRY_DSN=your-staging-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=your-staging-ga-id
```

#### Production (.env.production)
```env
# API Configuration
VITE_API_URL=https://api.cnc-taskmanager.com/api
VITE_SIGNALR_URL=https://api.cnc-taskmanager.com/hubs

# Application Settings
VITE_APP_NAME=CNC Task Management
VITE_APP_VERSION=2.1.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false

# External Services
VITE_SENTRY_DSN=your-production-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=your-production-ga-id
```

## Build Process

### Standard Build

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build
```

### Build Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check bundle size limits
npm run build:size-check
```

### Build Optimization

The build process includes:
- Code splitting by route
- Tree shaking for unused code
- Asset optimization and minification
- Source map generation (controlled by environment)
- Service worker generation for PWA functionality

## Deployment Options

### 1. Traditional Web Server

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name cnc-taskmanager.com www.cnc-taskmanager.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cnc-taskmanager.com www.cnc-taskmanager.com;

    # SSL certificates
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Root directory
    root /var/www/cnc-taskmanager/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName cnc-taskmanager.com
    Redirect permanent / https://cnc-taskmanager.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName cnc-taskmanager.com
    DocumentRoot /var/www/cnc-taskmanager/dist

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key

    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>

    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public, immutable"
    </LocationMatch>

    # Handle client-side routing
    <Directory "/var/www/cnc-taskmanager/dist">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 2. Cloud Platform Deployment

#### Vercel Deployment

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Deploy with Vercel CLI:

```bash
npm install -g vercel
vercel --prod
```

#### Netlify Deployment

Create `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

Deploy with Netlify CLI:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### AWS S3 + CloudFront

1. **Build and upload to S3**:

```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

2. **CloudFront distribution configuration**:

```json
{
  "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": [
    {
      "ErrorCode": 403,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200"
    },
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200"
    }
  ]
}
```

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Build and Run

```bash
# Build Docker image
docker build -t cnc-task-frontend .

# Run with Docker Compose
docker-compose up -d

# Scale for load balancing
docker-compose up -d --scale frontend=3
```

## CDN Configuration

### CloudFlare Setup

1. **Page Rules**:
   - Cache static assets for 1 year
   - Enable auto-minification
   - Enable Brotli compression

2. **Browser Cache TTL**:
   - Static assets: 1 year
   - HTML files: 4 hours

3. **Security Settings**:
   - Enable SSL (Full)
   - Enable HSTS
   - Enable Web Application Firewall

### CDN Caching Strategy

```javascript
// In your build process or nginx config
const cacheHeaders = {
  // Static assets - long term cache
  'static/**': {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  // HTML files - short cache for updates
  '*.html': {
    'Cache-Control': 'public, max-age=14400, must-revalidate',
  },
  // API responses - very short cache
  '/api/**': {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  }
}
```

## Environment-Specific Settings

### Development Environment

```bash
# Start with hot reload
npm run dev

# Start with mock data
npm run dev:mock

# Start with specific environment
VITE_USER_ENV=dev npm run dev
```

### Staging Environment

```bash
# Build for staging
npm run build:staging

# Deploy to staging
npm run deploy:staging
```

### Production Environment

```bash
# Build for production
npm run build

# Deploy to production
npm run deploy:prod

# Rollback deployment
npm run rollback:prod
```

## Monitoring and Logging

### Application Performance Monitoring

#### Sentry Integration

```javascript
// src/monitoring/sentry.ts
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Integrations.BrowserTracing(),
    ],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
  })
}
```

#### Google Analytics

```javascript
// src/monitoring/analytics.ts
import { VITE_GOOGLE_ANALYTICS_ID } from '/env'

export const initAnalytics = () => {
  if (VITE_GOOGLE_ANALYTICS_ID && import.meta.env.PROD) {
    gtag('config', VITE_GOOGLE_ANALYTICS_ID, {
      send_page_view: false,
    })
  }
}

export const trackPageView = (path: string) => {
  if (VITE_GOOGLE_ANALYTICS_ID && import.meta.env.PROD) {
    gtag('config', VITE_GOOGLE_ANALYTICS_ID, {
      page_path: path,
    })
  }
}
```

### Health Checks

```javascript
// health-check.js
const healthCheck = async () => {
  try {
    const response = await fetch('/api/health')
    const data = await response.json()
    console.log('Health check passed:', data)
  } catch (error) {
    console.error('Health check failed:', error)
    // Send alert to monitoring service
  }
}

// Run health check every 5 minutes
setInterval(healthCheck, 300000)
```

### Logging Strategy

```javascript
// src/utils/logger.ts
const isDevelopment = import.meta.env.DEV

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
    // Send to monitoring service in production
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
    // Send to monitoring service in production
  }
}
```

## Troubleshooting

### Common Issues

1. **Build fails due to memory issues**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

2. **Assets not loading after deployment**:
   - Check base URL in Vite config
   - Verify asset paths in HTML
   - Check CDN configuration

3. **Routing issues on refresh**:
   - Ensure server is configured for SPA routing
   - Check nginx/Apache configuration
   - Verify fallback to index.html

4. **CORS issues**:
   - Configure backend CORS settings
   - Check API URL configuration
   - Verify preflight request handling

### Performance Issues

1. **Slow initial load**:
   ```bash
   # Analyze bundle size
   npm run build:analyze

   # Check largest chunks
   npx vite-bundle-analyzer dist
   ```

2. **Memory leaks**:
   - Check React DevTools Profiler
   - Look for unresolved promises
   - Verify event listener cleanup

### Debugging Deployed Applications

1. **Source map debugging**:
   ```javascript
   // Enable source maps in staging
   if (import.meta.env.MODE === 'staging') {
     // Enable source map loading
   }
   ```

2. **Remote debugging**:
   ```javascript
   // Add debug endpoint
   app.get('/debug', (req, res) => {
     res.json({
       version: import.meta.env.VITE_APP_VERSION,
       environment: import.meta.env.MODE,
       buildTime: import.meta.env.VITE_BUILD_TIME,
     })
   })
   ```

## Security Considerations

1. **Content Security Policy**:
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
   ```

2. **Environment Variable Security**:
   - Never expose sensitive data in frontend
   - Use backend for sensitive operations
   - Validate all user inputs

3. **Dependency Security**:
   ```bash
   # Audit dependencies
   npm audit

   # Fix vulnerabilities
   npm audit fix
   ```

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Update dependencies
   - Check bundle size
   - Review performance metrics

2. **Monthly**:
   - Security audit
   - Accessibility testing
   - Performance optimization

3. **Quarterly**:
   - Major dependency updates
   - Architecture review
   - User feedback analysis

### Backup Strategy

1. **Code backups**: Use Git with proper tagging
2. **Configuration backups**: Store environment configs securely
3. **Build artifacts**: Keep recent builds for rollback

### Rollback Procedures

1. **Quick rollback**:
   ```bash
   # Switch to previous version
   git checkout previous-tag
   npm run build
   npm run deploy
   ```

2. **Database rollback** (if applicable):
   - Contact backend team
   - Verify API compatibility
   - Test critical functionality

This deployment guide should help you successfully deploy and maintain the CNC Task Management System frontend in various environments.