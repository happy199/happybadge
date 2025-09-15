import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('/')
    
    // Essayer d'injecter du JavaScript malveillant
    const maliciousScript = '<script>alert("XSS")</script>'
    
    // Vérifier que le script n'est pas exécuté
    page.on('dialog', dialog => {
      expect(dialog.message()).not.toContain('XSS')
      dialog.dismiss()
    })
    
    // Essayer d'injecter du code dans les champs de formulaire
    await page.goto('/auth/register')
    await page.fill('input[name="firstName"]', maliciousScript)
    await page.fill('input[name="lastName"]', maliciousScript)
    await page.fill('input[name="email"]', maliciousScript)
    
    // Vérifier que le contenu est échappé
    const firstNameValue = await page.inputValue('input[name="firstName"]')
    expect(firstNameValue).not.toContain('<script>')
  })

  test('should prevent SQL injection', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Essayer des injections SQL courantes
    const sqlInjection = "'; DROP TABLE users; --"
    
    await page.fill('input[type="email"]', sqlInjection)
    await page.fill('input[type="password"]', sqlInjection)
    await page.click('button[type="submit"]')
    
    // Vérifier que l'application ne plante pas
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have secure headers', async ({ page }) => {
    const response = await page.goto('/')
    
    // Vérifier les headers de sécurité
    const headers = response?.headers()
    
    expect(headers?.['x-frame-options']).toBe('DENY')
    expect(headers?.['x-content-type-options']).toBe('nosniff')
    expect(headers?.['referrer-policy']).toBe('origin-when-cross-origin')
    expect(headers?.['permissions-policy']).toContain('camera=()')
  })

  test('should prevent CSRF attacks', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Vérifier que les formulaires ont des tokens CSRF
    const forms = page.locator('form')
    const formCount = await forms.count()
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i)
      const csrfToken = form.locator('input[name="_token"]')
      await expect(csrfToken).toBeVisible()
    }
  })

  test('should validate file uploads', async ({ page }) => {
    await page.goto('/event/test-event')
    
    // Essayer d'uploader un fichier non autorisé
    const maliciousFile = {
      name: 'malicious.exe',
      mimeType: 'application/x-executable',
      buffer: Buffer.from('malicious-content'),
    }
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(maliciousFile)
    
    // Vérifier que l'erreur de validation est affichée
    await expect(page.locator('text=Format d\'image non supporté')).toBeVisible()
  })

  test('should prevent directory traversal', async ({ page }) => {
    // Essayer d'accéder à des fichiers système
    const response = await page.goto('/../../../etc/passwd')
    
    // Vérifier que l'accès est refusé
    expect(response?.status()).toBe(404)
  })

  test('should have secure authentication', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Vérifier que les mots de passe sont masqués
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Vérifier que les sessions expirent
    await page.goto('/dashboard')
    
    // Simuler l'expiration de session
    await page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token')
    })
    
    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL('/auth/login')
  })

  test('should prevent brute force attacks', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Essayer plusieurs connexions échouées
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'wrong-password')
      await page.click('button[type="submit"]')
      
      // Attendre que l'erreur soit affichée
      await expect(page.locator('text=Erreur de connexion')).toBeVisible()
    }
    
    // Vérifier que le compte est temporairement bloqué
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correct-password')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Compte temporairement bloqué')).toBeVisible()
  })

  test('should sanitize user input', async ({ page }) => {
    await page.goto('/dashboard/events/new')
    
    // Essayer d'injecter du HTML malveillant
    const maliciousHtml = '<img src="x" onerror="alert(\'XSS\')">'
    
    await page.fill('input[name="title"]', maliciousHtml)
    await page.fill('textarea[name="description"]', maliciousHtml)
    
    // Vérifier que le contenu est échappé
    const titleValue = await page.inputValue('input[name="title"]')
    expect(titleValue).not.toContain('<img')
    expect(titleValue).not.toContain('onerror')
  })
})

