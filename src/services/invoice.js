import api from './api'

export const invoiceService = {
  async generateInvoice(ticketId) {
    const response = await api.post(`/tickets/${ticketId}/generate_invoice/`)
    return response.data
  },
}
