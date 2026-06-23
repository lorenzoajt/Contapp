import api from './api'

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },

  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password })
    const { access, refresh } = response.data

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)

    // Get user profile
    const userProfile = await this.getProfile()
    localStorage.setItem('user', JSON.stringify(userProfile))

    return userProfile
  },

  async logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  async getProfile() {
    const response = await api.get('/auth/profile/')
    return response.data
  },

  async updateProfile(userData) {
    const response = await api.patch('/auth/profile/', userData)
    localStorage.setItem('user', JSON.stringify(response.data))
    return response.data
  },

  getStoredUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  },
}
