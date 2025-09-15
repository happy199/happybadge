import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('should match homepage design', async ({ page }) => {
    await page.goto('/')
    
    // Prendre une capture d'écran de la page d'accueil
    await expect(page).toHaveScreenshot('homepage.png')
  })

  test('should match login page design', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Prendre une capture d'écran de la page de connexion
    await expect(page).toHaveScreenshot('login-page.png')
  })

  test('should match register page design', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Prendre une capture d'écran de la page d'inscription
    await expect(page).toHaveScreenshot('register-page.png')
  })

  test('should match dashboard design', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Prendre une capture d'écran du dashboard
    await expect(page).toHaveScreenshot('dashboard.png')
  })

  test('should match new event page design', async ({ page }) => {
    await page.goto('/dashboard/events/new')
    
    // Prendre une capture d'écran de la page de création d'événement
    await expect(page).toHaveScreenshot('new-event-page.png')
  })

  test('should match event page design', async ({ page }) => {
    await page.goto('/event/test-event')
    
    // Prendre une capture d'écran de la page d'événement
    await expect(page).toHaveScreenshot('event-page.png')
  })

  test('should match mobile homepage design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Prendre une capture d'écran de la page d'accueil mobile
    await expect(page).toHaveScreenshot('homepage-mobile.png')
  })

  test('should match tablet homepage design', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    // Prendre une capture d'écran de la page d'accueil tablette
    await expect(page).toHaveScreenshot('homepage-tablet.png')
  })

  test('should match desktop homepage design', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Prendre une capture d'écran de la page d'accueil desktop
    await expect(page).toHaveScreenshot('homepage-desktop.png')
  })

  test('should match dark mode design', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    
    // Prendre une capture d'écran en mode sombre
    await expect(page).toHaveScreenshot('homepage-dark.png')
  })

  test('should match high contrast design', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    
    // Appliquer un mode contraste élevé
    await page.addStyleTag({
      content: `
        * {
          background: black !important;
          color: white !important;
          border-color: white !important;
        }
      `
    })
    
    // Prendre une capture d'écran en mode contraste élevé
    await expect(page).toHaveScreenshot('homepage-high-contrast.png')
  })

  test('should match large font design', async ({ page }) => {
    await page.goto('/')
    
    // Appliquer une grande taille de police
    await page.addStyleTag({
      content: `
        * {
          font-size: 24px !important;
        }
      `
    })
    
    // Prendre une capture d'écran avec une grande police
    await expect(page).toHaveScreenshot('homepage-large-font.png')
  })

  test('should match small font design', async ({ page }) => {
    await page.goto('/')
    
    // Appliquer une petite taille de police
    await page.addStyleTag({
      content: `
        * {
          font-size: 12px !important;
        }
      `
    })
    
    // Prendre une capture d'écran avec une petite police
    await expect(page).toHaveScreenshot('homepage-small-font.png')
  })

  test('should match button hover states', async ({ page }) => {
    await page.goto('/')
    
    // Prendre une capture d'écran des boutons au survol
    const button = page.locator('text=Commencer gratuitement')
    await button.hover()
    
    await expect(page).toHaveScreenshot('homepage-button-hover.png')
  })

  test('should match button focus states', async ({ page }) => {
    await page.goto('/')
    
    // Prendre une capture d'écran des boutons au focus
    const button = page.locator('text=Commencer gratuitement')
    await button.focus()
    
    await expect(page).toHaveScreenshot('homepage-button-focus.png')
  })

  test('should match form validation states', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Prendre une capture d'écran des états de validation
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'short')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveScreenshot('login-validation-errors.png')
  })

  test('should match loading states', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Prendre une capture d'écran des états de chargement
    await page.evaluate(() => {
      // Simuler un état de chargement
      document.body.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      `
    })
    
    await expect(page).toHaveScreenshot('loading-state.png')
  })

  test('should match error states', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Prendre une capture d'écran des états d'erreur
    await page.evaluate(() => {
      // Simuler un état d'erreur
      document.body.innerHTML = `
        <div class="error">
          <h1>Erreur</h1>
          <p>Une erreur s'est produite</p>
          <button>Réessayer</button>
        </div>
      `
    })
    
    await expect(page).toHaveScreenshot('error-state.png')
  })

  test('should match success states', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Prendre une capture d'écran des états de succès
    await page.evaluate(() => {
      // Simuler un état de succès
      document.body.innerHTML = `
        <div class="success">
          <h1>Succès</h1>
          <p>Opération réussie</p>
          <button>Continuer</button>
        </div>
      `
    })
    
    await expect(page).toHaveScreenshot('success-state.png')
  })

  test('should match empty states', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Prendre une capture d'écran des états vides
    await page.evaluate(() => {
      // Simuler un état vide
      document.body.innerHTML = `
        <div class="empty">
          <h1>Aucun événement</h1>
          <p>Créez votre premier événement</p>
          <button>Créer un événement</button>
        </div>
      `
    })
    
    await expect(page).toHaveScreenshot('empty-state.png')
  })

  test('should match badge generation states', async ({ page }) => {
    await page.goto('/event/test-event')
    
    // Prendre une capture d'écran des états de génération de badge
    await page.fill('input[name="firstName"]', 'Jean')
    await page.fill('input[name="lastName"]', 'Dupont')
    await page.fill('input[name="email"]', 'jean.dupont@test.com')
    
    // Simuler l'upload d'une photo
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    })
    
    await expect(page).toHaveScreenshot('badge-generation-form.png')
  })

  test('should match badge preview states', async ({ page }) => {
    await page.goto('/event/test-event')
    
    // Prendre une capture d'écran des états d'aperçu de badge
    await page.evaluate(() => {
      // Simuler un aperçu de badge
      document.body.innerHTML = `
        <div class="badge-preview">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Badge preview" />
          <div class="badge-actions">
            <button>Télécharger</button>
            <button>Partager</button>
          </div>
        </div>
      `
    })
    
    await expect(page).toHaveScreenshot('badge-preview.png')
  })
})

