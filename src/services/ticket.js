import api from './api'

export const ticketService = {
  async getAll() {
    const response = await api.get('/tickets/')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/tickets/${id}/`)
    return response.data
  },

  async create(ticketData) {
    const formData = new FormData()

    if (ticketData.image) {
      formData.append('image', ticketData.image)
    }
    if (ticketData.fiscal_profile) {
      formData.append('fiscal_profile', ticketData.fiscal_profile)
    }
    if (ticketData.description) {
      formData.append('description', ticketData.description)
    }
    if (ticketData.amount) {
      formData.append('amount', ticketData.amount)
    }

    const response = await api.post('/tickets/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async update(id, ticketData) {
    const formData = new FormData()

    if (ticketData.image && typeof ticketData.image !== 'string') {
      formData.append('image', ticketData.image)
    }
    if (ticketData.fiscal_profile) {
      formData.append('fiscal_profile', ticketData.fiscal_profile)
    }
    if (ticketData.description) {
      formData.append('description', ticketData.description)
    }
    if (ticketData.amount) {
      formData.append('amount', ticketData.amount)
    }
    if (ticketData.status) {
      formData.append('status', ticketData.status)
    }

    const response = await api.patch(`/tickets/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async delete(id) {
    await api.delete(`/tickets/${id}/`)
  },

  async markInvoiced(id) {
    const response = await api.post(`/tickets/${id}/mark_invoiced/`)
    return response.data
  },

  async getByStatus(status) {
    const response = await api.get(`/tickets/by_status/?status=${status}`)
    return response.data
  },
}
