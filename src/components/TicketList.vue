<script setup>
import { ref, onMounted } from 'vue'
import { ticketService } from '../services/ticket'
import TicketDetail from './TicketDetail.vue'

const tickets = ref([])
const loading = ref(false)
const error = ref('')
const statusFilter = ref('')
const selectedTicket = ref(null)

const loadTickets = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await ticketService.getAll()
    tickets.value = data.results || data
  } catch (err) {
    error.value = 'Error al cargar los tickets'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const filterByStatus = async () => {
  if (!statusFilter.value) {
    loadTickets()
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await ticketService.getByStatus(statusFilter.value)
    tickets.value = data
  } catch (err) {
    error.value = 'Error al filtrar tickets'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const deleteTicket = async (id) => {
  if (!confirm('¿Está seguro de eliminar este ticket?')) {
    return
  }

  try {
    await ticketService.delete(id)
    await loadTickets()
  } catch (err) {
    error.value = 'Error al eliminar el ticket'
    console.error(err)
  }
}

const generateInvoice = async (ticket) => {
  // Mark ticket as invoiced
  try {
    await ticketService.markInvoiced(ticket.id)
    // Redirect to invoice generation URL
    window.open('https://alsea.interfactura.com/', '_blank')
    // Reload tickets to show updated status
    await loadTickets()
  } catch (err) {
    error.value = 'Error al marcar el ticket como facturado'
    console.error(err)
  }
}

const openTicketDetail = (ticket) => {
  selectedTicket.value = ticket
}

const closeTicketDetail = () => {
  selectedTicket.value = null
}

const handleTicketUpdated = async () => {
  await loadTickets()
  closeTicketDetail()
}

const getStatusClass = (status) => {
  return status ? status.toLowerCase() : ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadTickets()
})
</script>

<template>
  <div class="ticket-list">
    <div class="list-header">
      <h2>Mis Tickets</h2>

      <div class="filters">
        <select v-model="statusFilter" @change="filterByStatus">
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="INVOICED">Facturado</option>
          <option value="REJECTED">Rechazado</option>
        </select>
        <button @click="loadTickets" class="btn btn-refresh">Actualizar</button>
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando tickets...</div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && tickets.length === 0" class="empty-state">
      <p>No hay tickets registrados</p>
    </div>

    <div v-if="!loading && tickets.length > 0" class="tickets-grid">
      <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card" @click="openTicketDetail(ticket)">
        <div class="ticket-image">
          <img :src="ticket.image_url" :alt="`Ticket ${ticket.id}`" />
        </div>

        <div class="ticket-content">
          <div class="ticket-header">
            <span class="ticket-id">Ticket #{{ ticket.id }}</span>
            <span class="status-badge" :class="getStatusClass(ticket.status)">
              {{ ticket.status === 'PENDING' ? 'Pendiente' : ticket.status === 'INVOICED' ? 'Facturado' : 'Rechazado' }}
            </span>
          </div>

          <div v-if="ticket.ticket_number" class="ticket-info">
            <strong>No. Ticket:</strong> {{ ticket.ticket_number }}
          </div>

          <div v-if="ticket.store_name" class="ticket-info">
            <strong>Tienda:</strong> {{ ticket.store_name }}
          </div>

          <div v-if="ticket.ticket_date" class="ticket-info">
            <strong>Fecha:</strong> {{ formatDate(ticket.ticket_date) }}
          </div>

          <div v-if="ticket.fiscal_profile_data" class="ticket-profile">
            <strong>RFC:</strong> {{ ticket.fiscal_profile_data.rfc }}
          </div>

          <div v-if="ticket.amount" class="ticket-amount">
            <strong>Monto:</strong> ${{ parseFloat(ticket.amount).toFixed(2) }}
          </div>

          <div class="ticket-footer">
            Click para ver detalles
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <TicketDetail
      v-if="selectedTicket"
      :ticket="selectedTicket"
      @updated="handleTicketUpdated"
      @close="closeTicketDetail"
    />
  </div>
</template>

<style scoped>
.ticket-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.list-header h2 {
  color: #2c3e50;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filters select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  background: white;
  border-radius: 8px;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ticket-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ticket-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.ticket-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ticket-content {
  padding: 1.5rem;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ticket-id {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.invoiced {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.ticket-info,
.ticket-profile,
.ticket-amount {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.ticket-info strong,
.ticket-profile strong,
.ticket-amount strong {
  color: #2c3e50;
}

.ticket-footer {
  font-size: 0.85rem;
  color: #3498db;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  text-align: center;
  font-weight: 500;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.btn-invoice {
  background-color: #27ae60;
  color: white;
}

.btn-invoice:hover {
  background-color: #229954;
}

.btn-view {
  background-color: #3498db;
  color: white;
}

.btn-view:hover {
  background-color: #2980b9;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
  flex: 0.5;
}

.btn-delete:hover {
  background-color: #c0392b;
}

.btn-refresh {
  background-color: #95a5a6;
  color: white;
}

.btn-refresh:hover {
  background-color: #7f8c8d;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters {
    width: 100%;
    flex-direction: column;
  }

  .filters select,
  .btn-refresh {
    width: 100%;
  }

  .tickets-grid {
    grid-template-columns: 1fr;
  }

  .ticket-actions {
    flex-direction: column;
  }

  .btn-delete {
    flex: 1;
  }
}
</style>
