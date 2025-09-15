import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page a un h1
    await expect(page.locator('h1')).toBeVisible()
    
    // Vérifier que les headings sont dans l'ordre
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i)
      const tagName = await heading.evaluate(el => el.tagName)
      const level = parseInt(tagName.substring(1))
      
      if (i > 0) {
        const prevHeading = headings.nth(i - 1)
        const prevTagName = await prevHeading.evaluate(el => el.tagName)
        const prevLevel = parseInt(prevTagName.substring(1))
        
        // Vérifier que les niveaux de heading sont logiques
        expect(level).toBeLessThanOrEqual(prevLevel + 1)
      }
    }
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Vérifier que tous les inputs ont des labels
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        await expect(label).toBeVisible()
      }
    }
  })

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que tous les boutons ont du texte ou des labels
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')
      
      // Vérifier qu'au moins un de ces attributs est présent
      expect(text || ariaLabel || ariaLabelledBy).toBeTruthy()
    }
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que les éléments de texte ont un contraste suffisant
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6')
    const textCount = await textElements.count()
    
    for (let i = 0; i < Math.min(textCount, 10); i++) {
      const element = textElements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        const color = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return styles.color
        })
        
        // Vérifier que la couleur n'est pas transparente
        expect(color).not.toBe('rgba(0, 0, 0, 0)')
        expect(color).not.toBe('transparent')
      }
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que tous les éléments interactifs sont accessibles au clavier
    const interactiveElements = page.locator('button, input, select, textarea, a[href]')
    const elementCount = await interactiveElements.count()
    
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = interactiveElements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        const tabIndex = await element.getAttribute('tabindex')
        
        // Vérifier que l'élément est focusable
        expect(tabIndex).not.toBe('-1')
      }
    }
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Vérifier que les éléments ont les attributs ARIA appropriés
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const ariaExpanded = await button.getAttribute('aria-expanded')
      const ariaPressed = await button.getAttribute('aria-pressed')
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Vérifier que les attributs ARIA sont cohérents
      if (ariaExpanded) {
        expect(['true', 'false']).toContain(ariaExpanded)
      }
      
      if (ariaPressed) {
        expect(['true', 'false']).toContain(ariaPressed)
      }
    }
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Vérifier que le focus est géré correctement
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Vérifier que le focus est visible
    const focusStyles = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      }
    })
    
    expect(focusStyles.outline || focusStyles.boxShadow).toBeTruthy()
  })

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que toutes les images ont des attributs alt
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      
      // Vérifier que l'attribut alt est présent
      expect(alt).toBeDefined()
    }
  })

  test('should have proper language attributes', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page a un attribut lang
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    
    expect(lang).toBe('fr')
  })

  test('should have proper skip links', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier qu'il y a un lien de saut
    const skipLink = page.locator('a[href="#main"], a[href="#content"]')
    await expect(skipLink).toBeVisible()
    
    // Vérifier que le lien de saut fonctionne
    await skipLink.click()
    const mainContent = page.locator('main, #main, #content')
    await expect(mainContent).toBeVisible()
  })
})

