import axios from 'axios'

// Types matching the backend schemas
export interface Dream {
  id: number
  user_id: number
  title: string
  description?: string
  category: 'travel' | 'home' | 'education' | 'family' | 'freedom' | 'lifestyle' | 'health'
  target_amount: number
  target_date: string
  current_saved: number
  image_url?: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  created_at: string
  updated_at?: string
  
  // Calculated fields
  days_remaining: number
  amount_remaining: number
  daily_amount: number
  weekly_amount: number
  monthly_amount: number
  progress_percentage: number
  is_achievable: boolean
  comparisons: {
    coffees: number
    lunches_per_week: number
    movie_tickets: number
    streaming_services: number
  }
}

export interface DreamCreate {
  title: string
  description?: string
  category: Dream['category']
  target_amount: number
  target_date: string
  image_url?: string
}

export interface CalculationRequest {
  target_amount: number
  target_date: string
  current_saved?: number
}

export interface CalculationResponse {
  target_amount: number
  target_date: string
  current_saved: number
  amount_remaining: number
  days_remaining: number
  daily_amount: number
  weekly_amount: number
  monthly_amount: number
  comparisons: {
    coffees_per_day: number
    lunches_per_week: number
    streaming_services: number
    movie_tickets: number
  }
  motivation: string
  is_achievable: boolean
}

// Configure axios
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// API functions
export const dreamApi = {
  // Get all dreams
  async getDreams(): Promise<Dream[]> {
    const response = await api.get('/dreams/')
    return response.data
  },

  // Get a specific dream
  async getDream(id: number): Promise<Dream> {
    const response = await api.get(`/dreams/${id}`)
    return response.data
  },

  // Create a new dream
  async createDream(dream: DreamCreate): Promise<Dream> {
    const response = await api.post('/dreams/', dream)
    return response.data
  },

  // Update a dream
  async updateDream(id: number, updates: Partial<DreamCreate & { current_saved: number; status: Dream['status'] }>): Promise<Dream> {
    const response = await api.put(`/dreams/${id}`, updates)
    return response.data
  },

  // Delete a dream
  async deleteDream(id: number, hardDelete = false): Promise<void> {
    await api.delete(`/dreams/${id}?hard_delete=${hardDelete}`)
  },

  // Calculate dream amounts
  async calculateDream(calculation: CalculationRequest): Promise<CalculationResponse> {
    const response = await api.post('/dreams/calculate', calculation)
    return response.data
  }
}

export default api
