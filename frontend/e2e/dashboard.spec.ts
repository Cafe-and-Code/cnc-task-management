import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests, you'd log in through the UI
    await page.goto('/dashboard')
    // Mock the auth state
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'admin'
      }))
    })
    await page.reload()
  })

  test('should display dashboard page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome back, John')
  })

  test('should display project overview cards', async ({ page }) => {
    await expect(page.locator('[data-testid="project-cards"]')).toBeVisible()
    await expect(page.locator('[data-testid="active-projects"]')).toBeVisible()
    await expect(page.locator('[data-testid="completed-projects"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-tasks"]')).toBeVisible()
  })

  test('should display recent activity feed', async ({ page }) => {
    await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-item"]').first()).toBeVisible()
  })

  test('should display upcoming deadlines', async ({ page }) => {
    await expect(page.locator('[data-testid="upcoming-deadlines"]')).toBeVisible()
    await expect(page.locator('[data-testid="deadline-item"]').first()).toBeVisible()
  })

  test('should display sprint progress charts', async ({ page }) => {
    await expect(page.locator('[data-testid="sprint-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="burndown-chart"]')).toBeVisible()
  })

  test('should display quick actions', async ({ page }) => {
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible()
    await expect(page.locator('button:has-text("Create Project")')).toBeVisible()
    await expect(page.locator('button:has-text("Create Task")')).toBeVisible()
    await expect(page.locator('button:has-text("Start Sprint")')).toBeVisible()
  })

  test('should navigate to project creation page', async ({ page }) => {
    await page.click('button:has-text("Create Project")')
    await expect(page).toHaveURL('/projects/new')
  })

  test('should navigate to task creation page', async ({ page }) => {
    await page.click('button:has-text("Create Task")')
    await expect(page).toHaveURL('/tasks/new')
  })

  test('should refresh dashboard data', async ({ page }) => {
    const initialActivityCount = await page.locator('[data-testid="activity-item"]').count()

    await page.click('[data-testid="refresh-button"]')

    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()

    // Should hide loading after refresh
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible()
  })

  test('should display team performance metrics', async ({ page }) => {
    await expect(page.locator('[data-testid="team-metrics"]')).toBeVisible()
    await expect(page.locator('[data-testid="velocity-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="team-productivity"]')).toBeVisible()
  })

  test('should display notifications widget', async ({ page }) => {
    await expect(page.locator('[data-testid="notifications-widget"]')).toBeVisible()
    await expect(page.locator('[data-testid="notification-item"]').first()).toBeVisible()
  })

  test('should handle mobile responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Should collapse sidebar on mobile
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Should stack dashboard widgets vertically
    const dashboardGrid = page.locator('[data-testid="dashboard-grid"]')
    await expect(dashboardGrid).toHaveClass(/grid-cols-1/)
  })

  test('should allow filtering of activity feed', async ({ page }) => {
    await page.click('[data-testid="activity-filter"]')
    await page.click('text=Tasks')

    // Should filter activities to show only task-related items
    const activityItems = page.locator('[data-testid="activity-item"]')
    const firstItem = activityItems.first()
    await expect(firstItem).toContainText('task', { ignoreCase: true })
  })

  test('should allow date range filtering', async ({ page }) => {
    await page.click('[data-testid="date-filter"]')
    await page.click('text=Last 7 days')

    // Should show filtered date range
    await expect(page.locator('[data-testid="selected-date-range"]')).toContainText('Last 7 days')
  })

  test('should show empty state when no data available', async ({ page }) => {
    // Mock empty data response
    await page.route('**/api/dashboard/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [],
          tasks: [],
          activities: [],
          deadlines: []
        })
      })
    })

    await page.reload()

    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(page.locator('text=No data available')).toBeVisible()
    await expect(page.locator('button:has-text("Create your first project")')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route('**/api/dashboard/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' })
      })
    })

    await page.reload()

    await expect(page.locator('[data-testid="error-state"]')).toBeVisible()
    await expect(page.locator('text=Failed to load dashboard data')).toBeVisible()
    await expect(page.locator('button:has-text("Retry")')).toBeVisible()
  })
})