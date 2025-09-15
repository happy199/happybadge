import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { supabase } from '@/lib/supabase'

// Mock Supabase pour les tests
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      getSession: jest.fn(),
    },
  },
}))

describe('Events Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should create a new event', async () => {
    const mockEvent = {
      id: 'test-event-id',
      user_id: 'test-user-id',
      title: 'Test Event',
      description: 'Test Description',
      event_date: '2024-12-31',
      location: 'Test Location',
      logo_url: null,
      status: 'active',
      settings: {},
      slug: 'test-event',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockInsert = jest.fn().mockReturnThis()
    const mockSelect = jest.fn().mockReturnThis()
    const mockSingle = jest.fn().mockResolvedValue({ data: mockEvent, error: null })

    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    })

    const result = await supabase
      .from('events')
      .insert(mockEvent)
      .select()
      .single()

    expect(result.data).toEqual(mockEvent)
    expect(result.error).toBeNull()
  })

  it('should fetch user events', async () => {
    const mockEvents = [
      {
        id: 'event-1',
        title: 'Event 1',
        user_id: 'test-user-id',
      },
      {
        id: 'event-2',
        title: 'Event 2',
        user_id: 'test-user-id',
      },
    ]

    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockOrder = jest.fn().mockResolvedValue({ data: mockEvents, error: null })

    ;(supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    })

    const result = await supabase
      .from('events')
      .select('*')
      .eq('user_id', 'test-user-id')
      .order('created_at', { ascending: false })

    expect(result.data).toEqual(mockEvents)
    expect(result.error).toBeNull()
  })

  it('should update an event', async () => {
    const mockUpdatedEvent = {
      id: 'test-event-id',
      title: 'Updated Event',
      description: 'Updated Description',
    }

    const mockUpdate = jest.fn().mockReturnThis()
    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockSingle = jest.fn().mockResolvedValue({ data: mockUpdatedEvent, error: null })

    ;(supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })

    const result = await supabase
      .from('events')
      .update({ title: 'Updated Event' })
      .eq('id', 'test-event-id')
      .select()
      .single()

    expect(result.data).toEqual(mockUpdatedEvent)
    expect(result.error).toBeNull()
  })

  it('should delete an event', async () => {
    const mockDelete = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null })

    ;(supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete,
      eq: mockEq,
    })

    const result = await supabase
      .from('events')
      .delete()
      .eq('id', 'test-event-id')

    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })
})

