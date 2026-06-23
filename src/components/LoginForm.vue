<script setup>
import { ref } from 'vue'
import { authStore } from '../store/auth'

const emit = defineEmits(['switch-to-register'])

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const result = await authStore.login(username.value, password.value)

    if (!result.success) {
      error.value = result.error?.detail || JSON.stringify(result.error) || 'Login failed'
    }
  } catch (err) {
    error.value = 'An error occurred during login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <h2>Iniciar Sesión</h2>

    <form @submit.prevent="handleLogin">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-group">
        <label for="username">Usuario</label>
        <input
          type="text"
          id="username"
          v-model="username"
          required
          placeholder="Ingrese su usuario"
        />
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="Ingrese su contraseña"
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>
    </form>

    <p class="switch-auth">
      ¿No tienes cuenta?
      <a href="#" @click.prevent="emit('switch-to-register')">Regístrate aquí</a>
    </p>
  </div>
</template>

<style scoped>
.auth-form {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
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
