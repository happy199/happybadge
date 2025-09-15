import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard')
    
    // Simuler une session utilisateur
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          user_metadata: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      }))
    })
  })

  test('should display dashboard with welcome message', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page).toHaveTitle(/Dashboard/)
    await expect(page.locator('h1')).toContainText('Bonjour Test')
    await expect(page.locator('text=Gérez vos événements')).toBeVisible()
  })

  test('should display stats cards', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.locator('text=Événements')).toBeVisible()
    await expect(page.locator('text=Badges générés')).toBeVisible()
    await expect(page.locator('text=Revenus')).toBeVisible()
    await expect(page.locator('text=Nouveaux participants')).toBeVisible()
  })

  test('should display events section', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.locator('h2')).toContainText('Mes Événements')
    await expect(page.locator('text=Nouvel Événement')).toBeVisible()
  })

  test('should navigate to new event page', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.click('text=Nouvel Événement')
    await expect(page).toHaveURL('/dashboard/events/new')
  })

  test('should display empty state when no events', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Mock empty events
    await page.evaluate(() => {
      window.mockEvents = []
    })
    
    await expect(page.locator('text=Aucun événement créé')).toBeVisible()
    await expect(page.locator('text=Créer mon premier événement')).toBeVisible()
  })

  test('should display user plan badge', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.locator('text=Plan Gratuit')).toBeVisible()
  })

  test('should have logout button', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.locator('text=Déconnexion')).toBeVisible()
  })
})

