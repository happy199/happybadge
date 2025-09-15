import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page).toHaveTitle(/Connexion/)
    await expect(page.locator('h1')).toContainText('Connexion')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display register page', async ({ page }) => {
    await page.goto('/auth/register')
    
    await expect(page).toHaveTitle(/Créer un compte/)
    await expect(page.locator('h1')).toContainText('Créer un compte')
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.click('text=Créer un compte')
    await expect(page).toHaveURL('/auth/register')
    
    await page.click('text=Se connecter')
    await expect(page).toHaveURL('/auth/login')
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.click('button[type="submit"]')
    
    // Vérifier que les champs requis sont marqués comme invalides
    await expect(page.locator('input[type="email"]')).toHaveAttribute('required')
    await expect(page.locator('input[type="password"]')).toHaveAttribute('required')
  })

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Vérifier que l'erreur de validation est affichée
    await expect(page.locator('text=Email invalide')).toBeVisible()
  })
})

