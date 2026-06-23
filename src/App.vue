<script setup>
import { ref, computed } from 'vue'
import { authStore } from './store/auth'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import MyFiscalProfile from './components/MyFiscalProfile.vue'
import TicketUpload from './components/TicketUpload.vue'
import TicketList from './components/TicketList.vue'

const currentView = ref('tickets') // 'myProfile', 'tickets', 'uploadTicket', 'login', 'register'

const isAuthenticated = computed(() => authStore.isAuthenticated)

const showLogin = () => {
  currentView.value = 'login'
}

const showRegister = () => {
  currentView.value = 'register'
}

const showMyProfile = () => {
  currentView.value = 'myProfile'
}

const showTickets = () => {
  currentView.value = 'tickets'
}

const showUploadTicket = () => {
  currentView.value = 'uploadTicket'
}

const handleTicketUploaded = () => {
  showTickets()
}

const handleLogout = async () => {
  await authStore.logout()
  currentView.value = 'login'
}

// Initialize view based on auth status
if (!isAuthenticated.value) {
  currentView.value = 'login'
}
</script>

<template>
  <div class="app">
    <header>
      <div class="header-content">
        <h1>Sistema de Facturación</h1>
        <div v-if="isAuthenticated" class="user-menu">
          <span class="user-name">{{ authStore.user?.username }}</span>
          <button @click="showMyProfile" class="btn-profile">Mi Perfil Fiscal</button>
          <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <main>
      <!-- Authentication Views -->
      <div v-if="!isAuthenticated" class="auth-container">
        <LoginForm v-if="currentView === 'login'" @switch-to-register="showRegister" />
        <RegisterForm v-if="currentView === 'register'" @switch-to-login="showLogin" />
      </div>

      <!-- Main App Views -->
      <div v-else>
        <!-- Navigation -->
        <nav class="app-nav">
          <button
            @click="showTickets"
            class="nav-btn"
            :class="{ active: currentView === 'tickets' }"
          >
            Mis Tickets
          </button>
          <button
            @click="showUploadTicket"
            class="nav-btn"
            :class="{ active: currentView === 'uploadTicket' }"
          >
            Subir Ticket
          </button>
        </nav>

        <!-- Content -->
        <MyFiscalProfile v-if="currentView === 'myProfile'" />
        <TicketList v-if="currentView === 'tickets'" />
        <TicketUpload
          v-if="currentView === 'uploadTicket'"
          @ticket-uploaded="handleTicketUploaded"
        />
      </div>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 500;
}

.btn-profile {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-profile:hover {
  background-color: #2980b9;
}

.btn-logout {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: #c0392b;
}

main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.app-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: #ecf0f1;
  color: #2c3e50;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover {
  background-color: #d5dbdb;
}

.nav-btn.active {
  background-color: #3498db;
  color: white;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .app-nav {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
  }
}
</style>
