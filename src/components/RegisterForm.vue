<script setup>
import { ref } from 'vue'
import { authStore } from '../store/auth'

const emit = defineEmits(['switch-to-login'])

const formData = ref({
  username: '',
  email: '',
  password: '',
  password2: '',
  first_name: '',
  last_name: '',
})

const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''

  if (formData.value.password !== formData.value.password2) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true

  try {
    const result = await authStore.register(formData.value)

    if (!result.success) {
      if (typeof result.error === 'object') {
        error.value = Object.entries(result.error)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n')
      } else {
        error.value = result.error || 'Registration failed'
      }
    }
  } catch (err) {
    error.value = 'An error occurred during registration'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <h2>Registrarse</h2>

    <form @submit.prevent="handleRegister">
      <div v-if="error" class="error-message">
        <pre>{{ error }}</pre>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="username">Usuario *</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            required
            placeholder="Usuario"
          />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder="Email"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="first_name">Nombre</label>
          <input
            type="text"
            id="first_name"
            v-model="formData.first_name"
            placeholder="Nombre"
          />
        </div>

        <div class="form-group">
          <label for="last_name">Apellido</label>
          <input
            type="text"
            id="last_name"
            v-model="formData.last_name"
            placeholder="Apellido"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="password">Contraseña *</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          required
          placeholder="Contraseña"
        />
      </div>

      <div class="form-group">
        <label for="password2">Confirmar Contraseña *</label>
        <input
          type="password"
          id="password2"
          v-model="formData.password2"
          required
          placeholder="Confirmar contraseña"
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>

    <p class="switch-auth">
      ¿Ya tienes cuenta?
      <a href="#" @click.prevent="emit('switch-to-login')">Inicia sesión aquí</a>
    </p>
  </div>
</template>

<style scoped>
.auth-form {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
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

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.error-message pre {
  white-space: pre-wrap;
  margin: 0;
  font-family: inherit;
}

.switch-auth {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.switch-auth a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.switch-auth a:hover {
  text-decoration: underline;
}
</style>
