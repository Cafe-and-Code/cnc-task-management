# Frontend Migration Guide

This document contains migration scripts and procedures for updating the frontend application between versions.

## Table of Contents

1. [Version 2.1.0 Migration](#version-210-migration)
2. [Database Schema Changes](#database-schema-changes)
3. [API Endpoint Updates](#api-endpoint-updates)
4. [Component Deprecations](#component-deprecations)
5. [Configuration Changes](#configuration-changes)
6. [Testing Migration](#testing-migration)
7. [Rollback Procedures](#rollback-procedures)

## Version 2.1.0 Migration

### Overview

This migration guide covers the upgrade from version 2.0.x to 2.1.0 of the CNC Task Management System frontend.

### Breaking Changes

1. **Authentication Flow Changes**
   - JWT token storage location changed
   - Refresh token implementation updated
   - Session management improved

2. **Component API Changes**
   - Several component props renamed for consistency
   - Deprecated components removed
   - New component patterns introduced

3. **State Management Updates**
   - Redux store structure modified
   - RTK Query caching strategy updated
   - Performance optimizations implemented

### Migration Steps

#### Step 1: Update Dependencies

```bash
# Remove old dependencies
npm uninstall @old-package/old-component

# Install new dependencies
npm install @new-package/new-component@latest

# Update existing packages
npm update @package/package
```

#### Step 2: Update Configuration

```env
# New environment variables required
VITE_ENABLE_REAL_TIME_FEATURES=true
VITE_SIGNALR_URL=http://localhost:5000/hubs

# Updated default values
VITE_API_TIMEOUT=10000
VITE_CACHE_DURATION=300000
```

#### Step 3: Update Component Imports

**Before:**
```typescript
import { OldComponent } from '@components/old-component'
```

**After:**
```typescript
import { NewComponent } from '@components/new-component'
```

#### Step 4: Migrate Authentication Logic

**Before:**
```typescript
// Old authentication pattern
const token = localStorage.getItem('authToken')
api.defaults.headers.common['Authorization'] = `Bearer ${token}`
```

**After:**
```typescript
// New authentication pattern
import { authService } from '@services/authService'
await authService.initializeAuth()
```

#### Step 5: Update State Management

**Before:**
```typescript
// Old slice structure
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null
  }
})
```

**After:**
```typescript
// New slice structure
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    tokens: {
      access: null,
      refresh: null
    },
    session: {
      isActive: false,
      expiresAt: null
    }
  }
})
```

## Database Schema Changes

### Client-Side Storage Migration

```typescript
// Migration script for localStorage changes
const migrateLocalStorage = () => {
  try {
    // Migrate auth token structure
    const oldToken = localStorage.getItem('authToken')
    if (oldToken && !localStorage.getItem('auth.access')) {
      const newAuthStructure = {
        access: oldToken,
        refresh: localStorage.getItem('refreshToken'),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      }
      localStorage.setItem('auth', JSON.stringify(newAuthStructure))
      localStorage.removeItem('authToken')
    }

    // Migrate user preferences
    const oldPreferences = localStorage.getItem('userPrefs')
    if (oldPreferences && !localStorage.getItem('userPreferences')) {
      const newPreferences = {
        ...JSON.parse(oldPreferences),
        theme: 'system', // New default
        notifications: {
          email: true,
          push: false,
          inApp: true
        }
      }
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
    }

    console.log('localStorage migration completed successfully')
  } catch (error) {
    console.error('localStorage migration failed:', error)
  }
}

// Run migration on app startup
if (typeof window !== 'undefined') {
  migrateLocalStorage()
}
```

### IndexedDB Migration

```typescript
// IndexedDB schema migration for offline cache
const migrateIndexedDB = async () => {
  const DB_NAME = 'CNC_TaskManagement_DB'
  const DB_VERSION = 2

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create new object stores for v2.1.0
      if (!db.objectStoreNames.contains('offlineActions')) {
        const offlineStore = db.createObjectStore('offlineActions', {
          keyPath: 'id',
          autoIncrement: true
        })
        offlineStore.createIndex('timestamp', 'timestamp')
        offlineStore.createIndex('type', 'type')
      }

      // Update existing stores
      if (db.objectStoreNames.contains('projects')) {
        const projectStore = event.target.transaction!.objectStore('projects')
        projectStore.createIndex('lastModified', 'lastModified')
      }
    }
  })
}
```

## API Endpoint Updates

### Deprecated Endpoints

- `GET /api/users/profile` → Use `GET /api/auth/profile`
- `POST /api/auth/login` → Use `POST /api/auth/signin`
- `GET /api/projects/all` → Use `GET /api/projects` with filters

### New Endpoints

```typescript
// New real-time endpoints
const signalrEndpoints = {
  connect: '/api/hubs/notifications',
  projects: '/api/hubs/projects',
  tasks: '/api/hubs/tasks'
}

// New analytics endpoints
const analyticsEndpoints = {
  velocity: '/api/analytics/velocity',
  burndown: '/api/analytics/burndown',
  teamPerformance: '/api/analytics/team-performance'
}
```

### API Client Migration

```typescript
// Update service files to use new endpoints
// Before:
const getUserProfile = () => apiClient.get('/users/profile')

// After:
const getUserProfile = () => apiClient.get('/auth/profile')
```

## Component Deprecations

### Removed Components

1. **OldLoadingSpinner** → Use **LoadingSpinner** from `@components/ui`
2. **ModalComponent** → Use **Modal** from `@components/ui`
3. **DataTable** → Use **ResponsiveTable** from `@components/ui`

### Migration Examples

**Before:**
```typescript
import { OldLoadingSpinner } from '@components/old-components'

function MyComponent() {
  return <OldLoadingSpinner size="large" />
}
```

**After:**
```typescript
import { LoadingSpinner } from '@components/ui'

function MyComponent() {
  return <LoadingSpinner size="lg" />
}
```

## Configuration Changes

### Environment Variable Updates

```typescript
// Update vite.config.ts to handle new environment variables
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __ENABLE_REAL_TIME__: JSON.stringify(process.env.VITE_ENABLE_REAL_TIME_FEATURES),
    __SIGNALR_URL__: JSON.stringify(process.env.VITE_SIGNALR_URL)
  }
})
```

### Build Configuration Updates

```javascript
// Update package.json scripts
{
  "scripts": {
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "build:analyze": "vite build && npx vite-bundle-analyzer dist"
  }
}
```

## Testing Migration

### Update Test Files

**Before:**
```typescript
import { OldComponent } from '@components/old-component'

test('renders old component', () => {
  render(<OldComponent />)
  expect(screen.getByText('Old Content')).toBeInTheDocument()
})
```

**After:**
```typescript
import { NewComponent } from '@components/new-component'

test('renders new component', () => {
  render(<NewComponent />)
  expect(screen.getByText('New Content')).toBeInTheDocument()
})
```

### Update Mock Services

```typescript
// Update API mocks for new endpoints
const mockApi = {
  getProfile: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
  getProjects: jest.fn().mockResolvedValue([{ id: 1, name: 'Test Project' }])
}
```

### Update E2E Tests

```typescript
// Update Playwright tests for new UI patterns
test('should login with new authentication flow', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')

  // Check for new dashboard elements
  await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible()
})
```

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous version
git checkout v2.0.0
npm install
npm run build
npm run deploy
```

### Database Rollback

```typescript
// Rollback localStorage changes
const rollbackLocalStorage = () => {
  try {
    // Remove new keys
    localStorage.removeItem('auth')
    localStorage.removeItem('userPreferences')

    // Restore old keys (if backup exists)
    const authBackup = localStorage.getItem('auth.backup')
    if (authBackup) {
      localStorage.setItem('authToken', authBackup)
    }

    console.log('localStorage rollback completed')
  } catch (error) {
    console.error('localStorage rollback failed:', error)
  }
}
```

### Health Check After Rollback

```typescript
// Verify system health after rollback
const performHealthCheck = async () => {
  const checks = [
    checkAuthentication,
    checkApiConnectivity,
    checkDataIntegrity,
    checkComponentRendering
  ]

  const results = await Promise.allSettled(checks)
  const failures = results.filter(result => result.status === 'rejected')

  if (failures.length > 0) {
    console.error('Health check failures:', failures)
    return false
  }

  console.log('All health checks passed')
  return true
}
```

## Post-Migration Checklist

### Verification Steps

- [ ] All pages load without errors
- [ ] User authentication works correctly
- [ ] Real-time features function properly
- [ ] Mobile responsiveness maintained
- [ ] Performance meets benchmarks
- [ ] Accessibility features work
- [ ] All tests pass
- [ ] Analytics data flows correctly

### Performance Monitoring

```typescript
// Monitor key performance indicators after migration
const performanceMetrics = {
  pageLoadTime: measurePageLoadTime(),
  firstContentfulPaint: measureFCP(),
  largestContentfulPaint: measureLCP(),
  cumulativeLayoutShift: measureCLS(),
  firstInputDelay: measureFID()
}

// Alert if performance degrades significantly
if (performanceMetrics.pageLoadTime > 3000) {
  console.warn('Page load time exceeds threshold:', performanceMetrics.pageLoadTime)
}
```

### User Communication

1. **Announce Changes**: Notify users of new features and changes
2. **Provide Documentation**: Update user guides and help content
3. **Monitor Feedback**: Track user reactions and issues
4. **Quick Fixes**: Address any user-reported problems promptly

## Troubleshooting

### Common Migration Issues

1. **Authentication Failures**:
   - Check token migration script
   - Verify API endpoint updates
   - Clear browser cache and localStorage

2. **Component Rendering Errors**:
   - Update component imports
   - Check prop names and types
   - Verify CSS class names

3. **State Management Issues**:
   - Update Redux store structure
   - Migrate local state patterns
   - Verify data flow

4. **Performance Degradation**:
   - Analyze bundle size changes
   - Check for memory leaks
   - Optimize component re-renders

### Debug Tools

```typescript
// Enable debug mode for troubleshooting
const debugMode = import.meta.env.DEV

if (debugMode) {
  // Enable detailed logging
  console.info('Debug mode enabled')

  // Expose debugging utilities globally
  window.debugAPI = {
    getState: () => store.getState(),
    dispatch: store.dispatch,
    apiClient: apiClient
  }
}
```

### Support Procedures

1. **Monitor Error Rates**: Track error frequencies and types
2. **User Feedback Collection**: Gather user reports and issues
3. **Hotfix Deployment**: Prepare for quick patch releases
4. **Documentation Updates**: Keep troubleshooting guides current

---

For additional support during migration, please contact the development team or refer to the project documentation.