<script setup>
import { ref, onMounted } from 'vue'
import { fiscalProfileService } from '../services/fiscalProfile'

const emit = defineEmits(['edit-profile'])

const profiles = ref([])
const loading = ref(false)
const error = ref('')
const searchRfc = ref('')

const loadProfiles = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await fiscalProfileService.getAll()
    profiles.value = data.results || data
  } catch (err) {
    error.value = 'Error al cargar los perfiles'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const searchByRfc = async () => {
  if (!searchRfc.value) {
    loadProfiles()
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await fiscalProfileService.searchByRfc(searchRfc.value)
    profiles.value = data
  } catch (err) {
    error.value = 'Error al buscar por RFC'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const deleteProfile = async (id) => {
  if (!confirm('¿Está seguro de eliminar este perfil fiscal?')) {
    return
  }

  try {
    await fiscalProfileService.delete(id)
    await loadProfiles()
  } catch (err) {
    error.value = 'Error al eliminar el perfil'
    console.error(err)
  }
}

const editProfile = (profile) => {
  emit('edit-profile', profile)
}

onMounted(() => {
  loadProfiles()
})
</script>

<template>
  <div class="profile-list">
    <div class="list-header">
      <h2>Mis Perfiles Fiscales</h2>
      <div class="search-box">
        <input
          v-model="searchRfc"
          type="text"
          placeholder="Buscar por RFC..."
          @keyup.enter="searchByRfc"
        />
        <button @click="searchByRfc" class="btn btn-search">Buscar</button>
        <button @click="loadProfiles" class="btn btn-secondary">Todos</button>
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando perfiles...</div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && profiles.length === 0" class="empty-state">
      <p>No hay perfiles fiscales registrados</p>
    </div>

    <div v-if="!loading && profiles.length > 0" class="profiles-grid">
      <div v-for="profile in profiles" :key="profile.id" class="profile-card">
        <div class="profile-header">
          <h3>{{ profile.nombre }} {{ profile.primer_apellido }} {{ profile.segundo_apellido }}</h3>
          <span class="status" :class="profile.estatus_padron?.toLowerCase()">
            {{ profile.estatus_padron || 'N/A' }}
          </span>
        </div>

        <div class="profile-body">
          <div class="profile-field">
            <strong>RFC:</strong> {{ profile.rfc }}
          </div>
          <div class="profile-field" v-if="profile.curp">
            <strong>CURP:</strong> {{ profile.curp }}
          </div>
          <div class="profile-field" v-if="profile.nombre_comercial">
            <strong>Nombre Comercial:</strong> {{ profile.nombre_comercial }}
          </div>
          <div class="profile-field" v-if="profile.fecha_inicio_operaciones">
            <strong>Fecha Inicio:</strong> {{ profile.fecha_inicio_operaciones }}
          </div>

          <div v-if="profile.nombre_vialidad || profile.codigo_postal" class="address-section">
            <strong>Domicilio:</strong>
            <p>
              <span v-if="profile.tipo_vialidad">{{ profile.tipo_vialidad }} </span>
              <span v-if="profile.nombre_vialidad">{{ profile.nombre_vialidad }} </span>
              <span v-if="profile.numero_exterior">No. {{ profile.numero_exterior }} </span>
              <span v-if="profile.numero_interior">Int. {{ profile.numero_interior }} </span>
              <br v-if="profile.nombre_colonia" />
              <span v-if="profile.nombre_colonia">{{ profile.nombre_colonia }}, </span>
              <span v-if="profile.codigo_postal">C.P. {{ profile.codigo_postal }} </span>
              <br v-if="profile.nombre_localidad" />
              <span v-if="profile.nombre_localidad">{{ profile.nombre_localidad }}, </span>
              <span v-if="profile.nombre_municipio">{{ profile.nombre_municipio }}, </span>
              <span v-if="profile.nombre_entidad_federativa">{{ profile.nombre_entidad_federativa }}</span>
            </p>
          </div>
        </div>

        <div class="profile-actions">
          <button @click="editProfile(profile)" class="btn btn-edit">Editar</button>
          <button @click="deleteProfile(profile.id)" class="btn btn-delete">Eliminar</button>
        </div>

        <div class="profile-footer">
          <small>Creado: {{ new Date(profile.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-list {
  width: 100%;
}

.list-header {
  margin-bottom: 2rem;
}

.list-header h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
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

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #eee;
}

.profile-header h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin: 0;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.activo {
  background-color: #d4edda;
  color: #155724;
}

.status.inactivo {
  background-color: #f8d7da;
  color: #721c24;
}

.status.suspendido {
  background-color: #fff3cd;
  color: #856404;
}

.profile-body {
  margin-bottom: 1rem;
}

.profile-field {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.profile-field strong {
  color: #2c3e50;
  margin-right: 0.5rem;
}

.address-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
}

.address-section strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.address-section p {
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-search {
  background-color: #3498db;
  color: white;
}

.btn-search:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-edit {
  flex: 1;
  background-color: #3498db;
  color: white;
}

.btn-edit:hover {
  background-color: #2980b9;
}

.btn-delete {
  flex: 1;
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
}

.profile-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
  text-align: right;
}

.profile-footer small {
  color: #999;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .profiles-grid {
    grid-template-columns: 1fr;
  }

  .search-box {
    flex-direction: column;
  }
}
</style>
