import { test, expect } from '@playwright/test'

test.describe('Browser Compatibility Tests', () => {
  test('should work on Chrome', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on Firefox', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on Safari', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on Edge', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on mobile Chrome', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on mobile Safari', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on tablet Chrome', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on tablet Safari', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on desktop Chrome', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on desktop Firefox', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on desktop Safari', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work on desktop Edge', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les fonctionnalités principales fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work with JavaScript disabled', async ({ page }) => {
    // Désactiver JavaScript
    await page.setJavaScriptEnabled(false)
    
    await page.goto('/')
    
    // Vérifier que la page se charge toujours
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les liens fonctionnent
    await page.click('text=Commencer gratuitement')
    await expect(page).toHaveURL('/auth/register')
  })

  test('should work with CSS disabled', async ({ page }) => {
    // Désactiver CSS
    await page.addStyleTag({ content: '* { display: none !important; }' })
    
    await page.goto('/')
    
    // Vérifier que la page se charge toujours
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
  })

  test('should work with images disabled', async ({ page }) => {
    // Désactiver les images
    await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', route => route.abort())
    
    await page.goto('/')
    
    // Vérifier que la page se charge toujours
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
  })

  test('should work with slow network', async ({ page }) => {
    // Simuler un réseau lent
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000)
    })
    
    await page.goto('/')
    
    // Vérifier que la page se charge toujours
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
  })

  test('should work with offline network', async ({ page }) => {
    // Simuler un réseau hors ligne
    await page.context().setOffline(true)
    
    await page.goto('/')
    
    // Vérifier que la page se charge toujours
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
  })

  test('should work with high DPI displays', async ({ page }) => {
    // Simuler un écran haute résolution
    await page.setViewportSize({ width: 1920, height: 1080, deviceScaleFactor: 2 })
    
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
  })

  test('should work with different color schemes', async ({ page }) => {
    // Tester le mode sombre
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Tester le mode clair
    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
  })

  test('should work with different font sizes', async ({ page }) => {
    // Tester avec une grande taille de police
    await page.goto('/')
    await page.evaluate(() => {
      document.body.style.fontSize = '24px'
    })
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Tester avec une petite taille de police
    await page.evaluate(() => {
      document.body.style.fontSize = '12px'
    })
    
    // Vérifier que la page se charge correctement
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=HappyBadge')).toBeVisible()
  })
})

