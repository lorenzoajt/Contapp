<script setup>
import { ref, watch } from 'vue'
import { ticketService } from '../services/ticket'
import { invoiceService } from '../services/invoice'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['updated', 'close'])

const formData = ref({
  ticket_number: '',
  store_name: '',
  ticket_date: '',
  amount: '',
  description: '',
  uso_cfdi: ''
})

const loading = ref(false)
const invoicing = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')

// Uso CFDI options
const usoCfdiOptions = [
  { value: 'S01', label: 'S01 - Sin efectos fiscales' },
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobilario y equipo de oficina' },
  { value: 'I03', label: 'I03 - Equipo de transporte' },
  { value: 'I04', label: 'I04 - Equipo de cómputo y accesorios' },
  { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
  { value: 'D04', label: 'D04 - Donativos' },
  { value: 'D10', label: 'D10 - Pagos por servicios educativos' },
  { value: 'P01', label: 'P01 - Por definir' },
]

// Initialize form with ticket data
watch(() => props.ticket, (newTicket) => {
  if (newTicket) {
    formData.value = {
      ticket_number: newTicket.ticket_number || '',
      store_name: newTicket.store_name || '',
      ticket_date: newTicket.ticket_date || '',
      amount: newTicket.amount || '',
      description: newTicket.description || '',
      uso_cfdi: newTicket.uso_cfdi || 'S01'
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await ticketService.update(props.ticket.id, formData.value)
    success.value = 'Ticket actualizado correctamente'
    setTimeout(() => {
      success.value = ''
      emit('updated')
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al actualizar el ticket'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const generateInvoice = async () => {
  if (!formData.value.uso_cfdi) {
    error.value = 'Por favor seleccione el Uso de CFDI antes de generar la factura'
    return
  }

  invoicing.value = true
  error.value = ''
  success.value = ''

  try {
    // First save the current form data (including uso_cfdi)
    await ticketService.update(props.ticket.id, formData.value)

    // Then generate invoice
    const result = await invoiceService.generateInvoice(props.ticket.id)

    if (result.success) {
      success.value = `Factura generada exitosamente. Se envió a: ${result.email}`

      // Open download links if available
      if (result.pdf_url) {
        window.open(result.pdf_url, '_blank')
      }

      setTimeout(() => {
        emit('updated')
      }, 2000)
    } else {
      error.value = result.message || 'Error al generar la factura'
      if (result.error) {
        error.value += `: ${result.error}`
      }
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al generar la factura'
    console.error(err)
  } finally {
    invoicing.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.')) {
    return
  }

  deleting.value = true
  error.value = ''

  try {
    await ticketService.delete(props.ticket.id)
    success.value = 'Ticket eliminado correctamente'
    setTimeout(() => {
      emit('updated')
      emit('close')
    }, 1000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al eliminar el ticket'
    console.error(err)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="ticket-detail">
    <div class="modal-overlay" @click="emit('close')"></div>

    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalles del Ticket #{{ ticket.id }}</h2>
        <button @click="emit('close')" class="btn-close">×</button>
      </div>

      <div class="modal-body">
        <div class="ticket-image-section">
          <img :src="ticket.image_url" :alt="`Ticket ${ticket.id}`" />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <form @submit.prevent="handleSubmit" class="ticket-form">
          <h3>Datos Extraídos del Ticket</h3>

          <div class="form-group">
            <label for="ticket_number">Número de Ticket</label>
            <input
              type="text"
              id="ticket_number"
              v-model="formData.ticket_number"
              placeholder="Número de ticket"
            />
            <small v-if="ticket.ticket_number" class="extracted-badge">
              Extraído automáticamente
            </small>
          </div>

          <div class="form-group">
            <label for="store_name">Tienda</label>
            <input
              type="text"
              id="store_name"
              v-model="formData.store_name"
              placeholder="Nombre de la tienda"
            />
            <small v-if="ticket.store_name" class="extracted-badge">
              Extraído automáticamente
            </small>
          </div>

          <div class="form-group">
            <label for="ticket_date">Fecha</label>
            <input
              type="date"
              id="ticket_date"
              v-model="formData.ticket_date"
            />
            <small v-if="ticket.ticket_date" class="extracted-badge">
              Extraído automáticamente
            </small>
          </div>

          <div class="form-group">
            <label for="amount">Monto</label>
            <input
              type="number"
              id="amount"
              v-model="formData.amount"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              placeholder="Notas adicionales"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="uso_cfdi">Uso de CFDI *</label>
            <select id="uso_cfdi" v-model="formData.uso_cfdi" required>
              <option value="">Seleccione uso de CFDI...</option>
              <option v-for="option in usoCfdiOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <small class="help-text">Requerido para generar factura</small>
          </div>

          <div v-if="success" class="success-message">{{ success }}</div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <button
              v-if="ticket.status === 'PENDING'"
              type="button"
              @click="generateInvoice"
              class="btn btn-invoice"
              :disabled="invoicing || !formData.uso_cfdi"
            >
              {{ invoicing ? 'Generando Factura...' : 'Generar Factura' }}
            </button>
            <button
              type="button"
              @click="handleDelete"
              class="btn btn-danger"
              :disabled="deleting"
            >
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
            <button type="button" @click="emit('close')" class="btn btn-secondary">
              Cerrar
            </button>
          </div>
        </form>

        <div v-if="ticket.ocr_raw_text" class="ocr-section">
          <details>
            <summary>Ver texto extraído completo</summary>
            <pre>{{ ticket.ocr_raw_text }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-detail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.ticket-image-section {
  margin-bottom: 2rem;
  text-align: center;
}

.ticket-image-section img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.ticket-form h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 0.9rem;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

textarea {
  resize: vertical;
  font-family: inherit;
}

.extracted-badge {
  display: inline-block;
  margin-top: 0.25rem;
  color: #27ae60;
  font-size: 0.8rem;
  font-weight: 500;
}

.extracted-badge::before {
  content: '✓ ';
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-invoice {
  background-color: #27ae60;
  color: white;
}

.btn-invoice:hover:not(:disabled) {
  background-color: #229954;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}

.ocr-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.ocr-section summary {
  cursor: pointer;
  color: #3498db;
  font-weight: 500;
  user-select: none;
}

.ocr-section summary:hover {
  color: #2980b9;
}

.ocr-section pre {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 95vh;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary {
    flex: none;
  }
}
</style>
