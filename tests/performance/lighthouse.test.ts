import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should have good Lighthouse scores', async ({ page }) => {
    await page.goto('/')
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle')
    
    // Vérifier que les éléments principaux sont visibles
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Générez des badges')).toBeVisible()
    
    // Vérifier que les images sont chargées
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toBeVisible()
    }
  })

  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Vérifier que la page se charge en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000)
    
    // Vérifier que les éléments principaux sont visibles
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle large number of events', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Mock un grand nombre d'événements
    await page.evaluate(() => {
      window.mockEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        description: `Description ${i}`,
        event_date: '2024-12-31',
        location: 'Test Location',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }))
    })
    
    // Vérifier que la page se charge toujours rapidement
    const startTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(5000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Mesurer le First Contentful Paint (FCP)
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime)
            }
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })
    
    // Vérifier que le FCP est inférieur à 1.8s
    expect(fcp).toBeLessThan(1800)
    
    // Mesurer le Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      })
    })
    
    // Vérifier que le LCP est inférieur à 2.5s
    expect(lcp).toBeLessThan(2500)
  })

  test('should handle concurrent badge generation', async ({ page }) => {
    await page.goto('/event/test-event')
    
    // Simuler plusieurs générations de badges simultanées
    const promises = Array.from({ length: 10 }, async (_, i) => {
      await page.fill('input[name="firstName"]', `User ${i}`)
      await page.fill('input[name="lastName"]', `Test`)
      await page.fill('input[name="email"]', `user${i}@test.com`)
      
      // Simuler l'upload d'une photo
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles({
        name: `photo-${i}.jpg`,
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      })
      
      // Cliquer sur le bouton de génération
      await page.click('button[type="submit"]')
    })
    
    // Vérifier que toutes les générations se terminent en moins de 30 secondes
    const startTime = Date.now()
    await Promise.all(promises)
    const totalTime = Date.now() - startTime
    
    expect(totalTime).toBeLessThan(30000)
  })
})

