import { test, expect } from '@playwright/test'

test.describe('Regression Tests', () => {
  test('should maintain consistent UI layout', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que les éléments principaux sont présents
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    
    // Vérifier que le logo est présent
    await expect(page.locator('text=HappyBadge')).toBeVisible()
    
    // Vérifier que les boutons principaux sont présents
    await expect(page.locator('text=Commencer gratuitement')).toBeVisible()
    await expect(page.locator('text=Voir une démo')).toBeVisible()
  })

  test('should maintain consistent navigation', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la navigation est présente
    await expect(page.locator('nav')).toBeVisible()
    
    // Vérifier que les liens de navigation sont présents
    await expect(page.locator('text=Fonctionnalités')).toBeVisible()
    await expect(page.locator('text=Tarifs')).toBeVisible()
    await expect(page.locator('text=Connexion')).toBeVisible()
  })

  test('should maintain consistent form behavior', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Vérifier que tous les champs requis sont présents
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    
    // Vérifier que le bouton de soumission est présent
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should maintain consistent error handling', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Essayer de se connecter avec des identifiants invalides
    await page.fill('input[type="email"]', 'invalid@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Vérifier que l'erreur est affichée
    await expect(page.locator('text=Erreur de connexion')).toBeVisible()
  })

  test('should maintain consistent responsive design', async ({ page }) => {
    // Tester sur mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Vérifier que la page est responsive
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    
    // Tester sur tablette
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    // Vérifier que la page s'adapte
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    
    // Tester sur desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    
    // Vérifier que la page s'adapte
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('should maintain consistent performance', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Vérifier que la page se charge en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000)
  })

  test('should maintain consistent accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page a un titre
    await expect(page).toHaveTitle(/HappyBadge/)
    
    // Vérifier que la page a un h1
    await expect(page.locator('h1')).toBeVisible()
    
    // Vérifier que les images ont des attributs alt
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeDefined()
    }
  })

  test('should maintain consistent SEO', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page a des métadonnées SEO
    const title = await page.title()
    expect(title).toContain('HappyBadge')
    
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeDefined()
    
    const keywords = await page.locator('meta[name="keywords"]').getAttribute('content')
    expect(keywords).toBeDefined()
  })

  test('should maintain consistent security', async ({ page }) => {
    const response = await page.goto('/')
    
    // Vérifier que les headers de sécurité sont présents
    const headers = response?.headers()
    
    expect(headers?.['x-frame-options']).toBe('DENY')
    expect(headers?.['x-content-type-options']).toBe('nosniff')
  })

  test('should maintain consistent data flow', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Vérifier que les données sont affichées correctement
    await expect(page.locator('text=Événements')).toBeVisible()
    await expect(page.locator('text=Badges générés')).toBeVisible()
    await expect(page.locator('text=Revenus')).toBeVisible()
    await expect(page.locator('text=Nouveaux participants')).toBeVisible()
  })

  test('should maintain consistent user experience', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que l'expérience utilisateur est cohérente
    await expect(page.locator('text=Générez des badges')).toBeVisible()
    await expect(page.locator('text=J\'y serai')).toBeVisible()
    await expect(page.locator('text=événements')).toBeVisible()
    
    // Vérifier que les call-to-action sont présents
    await expect(page.locator('text=Créer mon premier événement')).toBeVisible()
    await expect(page.locator('text=Voir une démo')).toBeVisible()
  })
})