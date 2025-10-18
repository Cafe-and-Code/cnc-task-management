import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard')
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

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toHaveCount(1)

    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    for (let i = 1; i < headings.length; i++) {
      const current = await headings[i].evaluate(el => el.tagName)
      const previous = await headings[i - 1].evaluate(el => el.tagName)

      // Headings should not skip levels
      const currentLevel = parseInt(current.charAt(1))
      const previousLevel = parseInt(previous.charAt(1))
      expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1)
    }
  })

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt?.length).toBeGreaterThan(0)
    }
  })

  test('should have proper ARIA labels', async ({ page }) => {
    // Check buttons without text content have aria-labels
    const iconButtons = page.locator('button:has(svg):not(:has-text))')
    const buttonCount = await iconButtons.count()

    for (let i = 0; i < buttonCount; i++) {
      const button = iconButtons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')

      expect(ariaLabel || ariaLabelledBy).toBeTruthy()
    }
  })

  test('should have proper form labels', async ({ page }) => {
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      const placeholder = await input.getAttribute('placeholder')

      // Each input should have an associated label
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const labelExists = await label.count() > 0
        expect(labelExists).toBe(true)
      } else {
        // If no id, should have aria-label, aria-labelledby, or placeholder
        expect(ariaLabel || ariaLabelledBy || placeholder).toBeTruthy()
      }
    }
  })

  test('should have proper focus management', async ({ page }) => {
    // Tab through interactive elements
    const focusableElements = page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const elementCount = await focusableElements.count()

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic test - in real implementation, you'd use a contrast checker
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button')
    const elementCount = await textElements.count()

    for (let i = 0; i < Math.min(elementCount, 20); i++) {
      const element = textElements.nth(i)
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        }
      })

      // Ensure colors are defined (not transparent)
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
      expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Test navigation menu
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Test menu navigation with arrow keys
    await page.keyboard.press('ArrowDown')
    await expect(page.locator(':focus')).toBeVisible()

    // Test Enter key on focused element
    const focused = page.locator(':focus')
    if (await focused.count() > 0) {
      const tagName = await focused.evaluate(el => el.tagName)
      if (tagName === 'BUTTON' || tagName === 'A') {
        await page.keyboard.press('Enter')
        // Should navigate or trigger action
      }
    }
  })

  test('should have skip navigation link', async ({ page }) => {
    // Look for skip navigation link
    const skipLink = page.locator('a[href*="skip"], a:has-text("Skip")')

    if (await skipLink.count() > 0) {
      await skipLink.first().click()
      // Should focus on main content
      const mainContent = page.locator('main, [role="main"], h1')
      await expect(mainContent.first()).toBeVisible()
    }
  })

  test('should have proper table accessibility', async ({ page }) => {
    const tables = page.locator('table')
    const tableCount = await tables.count()

    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i)

      // Check for table headers
      const headers = table.locator('th')
      const headerCount = await headers.count()
      expect(headerCount).toBeGreaterThan(0)

      // Check for caption if table has complex data
      const rows = table.locator('tr')
      if (await rows.count() > 3) {
        const caption = table.locator('caption')
        expect(await caption.count()).toBeGreaterThan(0)
      }
    }
  })

  test('should announce dynamic content changes', async ({ page }) => {
    // Test that dynamic changes are announced to screen readers
    await page.click('[data-testid="refresh-button"]')

    // Look for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
    const regionCount = await liveRegions.count()

    // Should have at least one live region for dynamic content
    expect(regionCount).toBeGreaterThan(0)
  })

  test('should have proper link text', async ({ page }) => {
    const links = page.locator('a[href]')
    const linkCount = await links.count()

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')

      // Links should have descriptive text
      const hasDescriptiveText =
        (text && text.trim().length > 0) ||
        (ariaLabel && ariaLabel.length > 0) ||
        (title && title.length > 0)

      expect(hasDescriptiveText).toBe(true)

      // Avoid generic link text like "click here" without context
      if (text) {
        expect(text.toLowerCase()).not.toBe('click here')
        expect(text.toLowerCase()).not.toBe('read more')
      }
    }
  })

  test('should handle reduced motion preference', async ({ page }) => {
    // Simulate prefers-reduced-motion setting
    await page.emulateMedia({ reducedMotion: 'reduce' })

    // Test that animations are disabled
    const animatedElements = page.locator('[style*="animation"], [class*="animate"]')

    // Elements should either not have animations or have reduced animations
    const elementCount = await animatedElements.count()
    for (let i = 0; i < elementCount; i++) {
      const element = animatedElements.nth(i)
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          animation: computed.animation,
          transition: computed.transition
        }
      })

      // Animations should be disabled or very short
      if (styles.animation !== 'none') {
        expect(styles.animation).toContain('0s')
      }
    }
  })
})