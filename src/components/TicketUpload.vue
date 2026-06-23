<script setup>
import { ref } from 'vue'
import { ticketService } from '../services/ticket'

const emit = defineEmits(['ticket-uploaded'])

const formData = ref({
  image: null,
  description: '',
  amount: ''
})

const imagePreview = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.image = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  if (!formData.value.image) {
    error.value = 'Por favor seleccione una imagen del ticket'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await ticketService.create(formData.value)
    success.value = true

    setTimeout(() => {
      resetForm()
      emit('ticket-uploaded')
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al subir el ticket'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    image: null,
    description: '',
    amount: ''
  }
  imagePreview.value = null
  success.value = false
  error.value = ''

  const fileInput = document.getElementById('ticketImage')
  if (fileInput) {
    fileInput.value = ''
  }
}
</script>

<template>
  <div class="ticket-upload">
    <h2>Subir Ticket</h2>

    <div v-if="success" class="success-message">
      Ticket subido exitosamente
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="upload-form">
      <div class="form-group">
        <label for="ticketImage">Imagen del Ticket *</label>
        <input
          type="file"
          id="ticketImage"
          accept="image/*"
          @change="handleFileChange"
          required
        />
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Preview" />
        </div>
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
          placeholder="Notas o comentarios sobre el ticket"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Subiendo...' : 'Subir Ticket' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="resetForm">
          Limpiar
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.ticket-upload {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.upload-form {
  max-width: 600px;
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

input[type="file"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
}

input[type="file"]:hover {
  border-color: #3498db;
}

input[type="number"],
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

textarea {
  resize: vertical;
  font-family: inherit;
}

.image-preview {
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.875rem 2rem;
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

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}
</style>
