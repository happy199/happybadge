import { cn, formatDate, formatCurrency, generateSlug, truncateText } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('handles undefined and null values', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2024-01-15'
      expect(formatDate(date)).toBe('15 janvier 2024')
    })

    it('handles Date object', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('15 janvier 2024')
    })
  })

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('1 234,56 €')
    })

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('0,00 €')
    })

    it('handles negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-100,00 €')
    })
  })

  describe('generateSlug', () => {
    it('generates slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('handles special characters', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world')
    })

    it('handles accents', () => {
      expect(generateSlug('Café & Thé')).toBe('cafe-the')
    })

    it('handles multiple spaces', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world')
    })

    it('handles empty string', () => {
      expect(generateSlug('')).toBe('')
    })
  })

  describe('truncateText', () => {
    it('truncates text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
    })

    it('returns original text if shorter than limit', () => {
      expect(truncateText('Hi', 5)).toBe('Hi')
    })

    it('returns original text if equal to limit', () => {
      expect(truncateText('Hello', 5)).toBe('Hello')
    })

    it('handles empty string', () => {
      expect(truncateText('', 5)).toBe('')
    })
  })
})

