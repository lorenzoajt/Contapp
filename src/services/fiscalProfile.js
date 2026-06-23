import api from './api'

export const fiscalProfileService = {
  async getAll() {
    const response = await api.get('/fiscal-profiles/')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/fiscal-profiles/${id}/`)
    return response.data
  },

  async create(profileData) {
    // Clean empty date fields - remove them instead of sending empty strings
    const cleanData = { ...profileData }
    if (cleanData.fecha_inicio_operaciones === '') {
      delete cleanData.fecha_inicio_operaciones
    }
    if (cleanData.fecha_ultimo_cambio_estado === '') {
      delete cleanData.fecha_ultimo_cambio_estado
    }
    const response = await api.post('/fiscal-profiles/', cleanData)
    return response.data
  },

  async update(id, profileData) {
    // Clean empty date fields - remove them instead of sending empty strings
    const cleanData = { ...profileData }
    if (cleanData.fecha_inicio_operaciones === '') {
      delete cleanData.fecha_inicio_operaciones
    }
    if (cleanData.fecha_ultimo_cambio_estado === '') {
      delete cleanData.fecha_ultimo_cambio_estado
    }
    const response = await api.patch(`/fiscal-profiles/${id}/`, cleanData)
    return response.data
  },

  async delete(id) {
    await api.delete(`/fiscal-profiles/${id}/`)
  },

  async searchByRfc(rfc) {
    const response = await api.get(`/fiscal-profiles/by_rfc/?rfc=${rfc}`)
    return response.data
  },

  async processConstancia(imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await api.post('/fiscal-profiles/process_constancia/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
