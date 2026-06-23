import { reactive } from 'vue'
import { authService } from '../services/auth'

export const authStore = reactive({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),

  async login(username, password) {
    try {
      const user = await authService.login(username, password)
      this.user = user
      this.isAuthenticated = true
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Login failed',
      }
    }
  },

  async register(userData) {
    try {
      await authService.register(userData)
      // Auto-login after registration
      return await this.login(userData.username, userData.password)
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Registration failed',
      }
    }
  },

  async logout() {
    await authService.logout()
    this.user = null
    this.isAuthenticated = false
  },

  async updateProfile(userData) {
    try {
      const user = await authService.updateProfile(userData)
      this.user = user
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Update failed',
      }
    }
  },
})
