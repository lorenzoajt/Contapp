<script setup>
import { ref, onMounted } from 'vue'
import { fiscalProfileService } from '../services/fiscalProfile'

const emit = defineEmits(['close'])

const profile = ref(null)
const loading = ref(false)
const saving = ref(false)
const processingConstancia = ref(false)
const error = ref('')
const success = ref('')
const isEditing = ref(false)
const constanciaPreview = ref(null)

const formData = ref({
  rfc: '',
  curp: '',
  nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  persona: 'FISICA',
  regimen_fiscal: '605',
  fecha_inicio_operaciones: '',
  estatus_padron: '',
  fecha_ultimo_cambio_estado: '',
  nombre_comercial: '',
  codigo_postal: '',
  tipo_vialidad: '',
  nombre_vialidad: '',
  numero_exterior: '',
  numero_interior: '',
  nombre_colonia: '',
  nombre_localidad: '',
  nombre_municipio: '',
  nombre_entidad_federativa: '',
  entre_calle: ''
})

const loadProfile = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await fiscalProfileService.getAll()
    const profiles = data.results || data

    if (profiles.length > 0) {
      profile.value = profiles[0]
      formData.value = {
        rfc: profile.value.rfc || '',
        curp: profile.value.curp || '',
        nombre: profile.value.nombre || '',
        primer_apellido: profile.value.primer_apellido || '',
        segundo_apellido: profile.value.segundo_apellido || '',
        persona: profile.value.persona || 'FISICA',
        regimen_fiscal: profile.value.regimen_fiscal || '605',
        fecha_inicio_operaciones: profile.value.fecha_inicio_operaciones || '',
        estatus_padron: profile.value.estatus_padron || '',
        fecha_ultimo_cambio_estado: profile.value.fecha_ultimo_cambio_estado || '',
        nombre_comercial: profile.value.nombre_comercial || '',
        codigo_postal: profile.value.codigo_postal || '',
        tipo_vialidad: profile.value.tipo_vialidad || '',
        nombre_vialidad: profile.value.nombre_vialidad || '',
        numero_exterior: profile.value.numero_exterior || '',
        numero_interior: profile.value.numero_interior || '',
        nombre_colonia: profile.value.nombre_colonia || '',
        nombre_localidad: profile.value.nombre_localidad || '',
        nombre_municipio: profile.value.nombre_municipio || '',
        nombre_entidad_federativa: profile.value.nombre_entidad_federativa || '',
        entre_calle: profile.value.entre_calle || ''
      }
    }
  } catch (err) {
    console.error('Error loading profile:', err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formData.value.nombre || !formData.value.rfc) {
    error.value = 'Por favor complete los campos obligatorios: Nombre y RFC'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    if (profile.value?.id) {
      await fiscalProfileService.update(profile.value.id, formData.value)
      success.value = 'Perfil actualizado correctamente'
    } else {
      await fiscalProfileService.create(formData.value)
      success.value = 'Perfil creado correctamente'
    }

    setTimeout(() => {
      success.value = ''
      isEditing.value = false
      loadProfile()
    }, 1500)
  } catch (err) {
    if (err.response?.data) {
      const errors = err.response.data
      if (typeof errors === 'object') {
        error.value = Object.entries(errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n')
      } else {
        error.value = errors
      }
    } else {
      error.value = 'Error al guardar el perfil fiscal'
    }
    console.error(err)
  } finally {
    saving.value = false
  }
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  constanciaPreview.value = null
  loadProfile()
}

const handleConstanciaUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  processingConstancia.value = true
  error.value = ''
  success.value = ''

  try {
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      constanciaPreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Process with OCR
    const extracted = await fiscalProfileService.processConstancia(file)

    // Prefill form data with extracted values
    if (extracted.rfc) formData.value.rfc = extracted.rfc
    if (extracted.nombre) formData.value.nombre = extracted.nombre
    if (extracted.primer_apellido) formData.value.primer_apellido = extracted.primer_apellido
    if (extracted.segundo_apellido) formData.value.segundo_apellido = extracted.segundo_apellido
    if (extracted.regimen_fiscal) formData.value.regimen_fiscal = extracted.regimen_fiscal
    if (extracted.codigo_postal) formData.value.codigo_postal = extracted.codigo_postal
    if (extracted.tipo_vialidad) formData.value.tipo_vialidad = extracted.tipo_vialidad
    if (extracted.nombre_vialidad) formData.value.nombre_vialidad = extracted.nombre_vialidad
    if (extracted.numero_exterior) formData.value.numero_exterior = extracted.numero_exterior
    if (extracted.numero_interior) formData.value.numero_interior = extracted.numero_interior
    if (extracted.nombre_colonia) formData.value.nombre_colonia = extracted.nombre_colonia
    if (extracted.nombre_localidad) formData.value.nombre_localidad = extracted.nombre_localidad
    if (extracted.nombre_municipio) formData.value.nombre_municipio = extracted.nombre_municipio
    if (extracted.nombre_entidad_federativa) formData.value.nombre_entidad_federativa = extracted.nombre_entidad_federativa
    if (extracted.entre_calle) formData.value.entre_calle = extracted.entre_calle

    success.value = 'Datos extraídos correctamente. Revisa y completa la información faltante.'

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = 'Error al procesar la constancia. Por favor completa los datos manualmente.'
    console.error(err)
  } finally {
    processingConstancia.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="my-fiscal-profile">
    <div class="profile-header">
      <h2>Mi Perfil Fiscal</h2>
      <p class="subtitle">Solo puedes tener un perfil fiscal por cuenta</p>
    </div>

    <div v-if="loading" class="loading">Cargando...</div>

    <div v-else-if="!profile && !isEditing" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3>No tienes un perfil fiscal</h3>
      <p>Crea tu perfil fiscal para poder generar facturas de tus tickets</p>
      <button @click="isEditing = true" class="btn btn-primary">
        Crear Mi Perfil Fiscal
      </button>
    </div>

    <div v-else-if="!isEditing && profile" class="profile-view">
      <div v-if="success" class="success-message">{{ success }}</div>

      <div class="profile-section">
        <h3>Datos de Identificación</h3>
        <div class="profile-grid">
          <div class="profile-field">
            <label>RFC</label>
            <p>{{ profile.rfc }}</p>
          </div>
          <div class="profile-field" v-if="profile.curp">
            <label>CURP</label>
            <p>{{ profile.curp }}</p>
          </div>
          <div class="profile-field">
            <label>Nombre(s)</label>
            <p>{{ profile.nombre }}</p>
          </div>
          <div class="profile-field" v-if="profile.primer_apellido">
            <label>Primer Apellido</label>
            <p>{{ profile.primer_apellido }}</p>
          </div>
          <div class="profile-field" v-if="profile.segundo_apellido">
            <label>Segundo Apellido</label>
            <p>{{ profile.segundo_apellido }}</p>
          </div>
          <div class="profile-field">
            <label>Tipo de Persona</label>
            <p>{{ profile.persona === 'FISICA' ? 'Persona Física' : 'Persona Moral' }}</p>
          </div>
          <div class="profile-field">
            <label>Régimen Fiscal</label>
            <p>{{ profile.regimen_fiscal }}</p>
          </div>
        </div>
      </div>

      <div class="profile-section" v-if="profile.codigo_postal">
        <h3>Domicilio</h3>
        <div class="profile-grid">
          <div class="profile-field" v-if="profile.codigo_postal">
            <label>Código Postal</label>
            <p>{{ profile.codigo_postal }}</p>
          </div>
          <div class="profile-field" v-if="profile.nombre_vialidad">
            <label>Vialidad</label>
            <p>{{ profile.tipo_vialidad }} {{ profile.nombre_vialidad }}</p>
          </div>
          <div class="profile-field" v-if="profile.numero_exterior">
            <label>Número Exterior</label>
            <p>{{ profile.numero_exterior }}</p>
          </div>
          <div class="profile-field" v-if="profile.nombre_colonia">
            <label>Colonia</label>
            <p>{{ profile.nombre_colonia }}</p>
          </div>
          <div class="profile-field" v-if="profile.nombre_municipio">
            <label>Municipio</label>
            <p>{{ profile.nombre_municipio }}</p>
          </div>
          <div class="profile-field" v-if="profile.nombre_entidad_federativa">
            <label>Estado</label>
            <p>{{ profile.nombre_entidad_federativa }}</p>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="startEditing" class="btn btn-primary">
          Editar Perfil
        </button>
      </div>
    </div>

    <div v-else class="profile-form">
      <div v-if="error" class="error-message">
        <pre>{{ error }}</pre>
      </div>

      <div v-if="success" class="success-message">{{ success }}</div>

      <form @submit.prevent="handleSubmit">
        <!-- Constancia Upload -->
        <section class="form-section constancia-section">
          <h3>Constancia de Situación Fiscal</h3>
          <p class="section-help">Sube tu Constancia de Situación Fiscal para auto-completar los campos</p>

          <div class="constancia-upload">
            <input
              type="file"
              id="constancia"
              accept="image/*"
              @change="handleConstanciaUpload"
              :disabled="processingConstancia"
              class="file-input"
            />
            <label for="constancia" class="file-label">
              <span v-if="!processingConstancia">📄 Seleccionar Constancia</span>
              <span v-else>⏳ Procesando...</span>
            </label>

            <div v-if="constanciaPreview" class="constancia-preview">
              <img :src="constanciaPreview" alt="Constancia preview" />
            </div>
          </div>
        </section>

        <!-- Datos de Identificación -->
        <section class="form-section">
          <h3>Datos de Identificación del Contribuyente</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="rfc">RFC <span class="required">*</span></label>
              <input
                type="text"
                id="rfc"
                v-model="formData.rfc"
                required
                placeholder="Ej: JOTL960205QN0"
                maxlength="13"
              />
            </div>

            <div class="form-group">
              <label for="curp">CURP</label>
              <input
                type="text"
                id="curp"
                v-model="formData.curp"
                placeholder="Ej: JOTL960205HOCQR03"
                maxlength="18"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre(s) <span class="required">*</span></label>
              <input
                type="text"
                id="nombre"
                v-model="formData.nombre"
                required
                placeholder="Ej: LORENZO ADRIAN"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="primer_apellido">Primer Apellido</label>
              <input
                type="text"
                id="primer_apellido"
                v-model="formData.primer_apellido"
                placeholder="Ej: JOAQUIN"
              />
            </div>

            <div class="form-group">
              <label for="segundo_apellido">Segundo Apellido</label>
              <input
                type="text"
                id="segundo_apellido"
                v-model="formData.segundo_apellido"
                placeholder="Ej: TORRES"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="persona">Tipo de Persona <span class="required">*</span></label>
              <select id="persona" v-model="formData.persona" required>
                <option value="FISICA">Persona Física</option>
                <option value="MORAL">Persona Moral</option>
              </select>
            </div>

            <div class="form-group">
              <label for="regimen_fiscal">Régimen Fiscal <span class="required">*</span></label>
              <select id="regimen_fiscal" v-model="formData.regimen_fiscal" required>
                <option value="601">601 - General de Ley Personas Morales</option>
                <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                <option value="606">606 - Arrendamiento</option>
                <option value="608">608 - Demás ingresos</option>
                <option value="610">610 - Residentes en el Extranjero sin Establecimiento Permanente en México</option>
                <option value="611">611 - Ingresos por Dividendos (socios y accionistas)</option>
                <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                <option value="614">614 - Ingresos por intereses</option>
                <option value="615">615 - Régimen de los ingresos por obtención de premios</option>
                <option value="616">616 - Sin obligaciones fiscales</option>
                <option value="621">621 - Incorporación Fiscal</option>
                <option value="625">625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                <option value="626">626 - Régimen Simplificado de Confianza</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="fecha_inicio_operaciones">Fecha Inicio de Operaciones</label>
              <input
                type="date"
                id="fecha_inicio_operaciones"
                v-model="formData.fecha_inicio_operaciones"
              />
            </div>

            <div class="form-group">
              <label for="estatus_padron">Estatus en el Padrón</label>
              <select id="estatus_padron" v-model="formData.estatus_padron">
                <option value="">Seleccione...</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="SUSPENDIDO">SUSPENDIDO</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="fecha_ultimo_cambio_estado">Fecha de Último Cambio de Estado</label>
              <input
                type="date"
                id="fecha_ultimo_cambio_estado"
                v-model="formData.fecha_ultimo_cambio_estado"
              />
            </div>

            <div class="form-group">
              <label for="nombre_comercial">Nombre Comercial</label>
              <input
                type="text"
                id="nombre_comercial"
                v-model="formData.nombre_comercial"
                placeholder="Opcional"
              />
            </div>
          </div>
        </section>

        <!-- Datos del Domicilio -->
        <section class="form-section">
          <h3>Datos del Domicilio Registrado</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="codigo_postal">Código Postal</label>
              <input
                type="text"
                id="codigo_postal"
                v-model="formData.codigo_postal"
                placeholder="Ej: 70620"
                maxlength="5"
              />
            </div>

            <div class="form-group">
              <label for="tipo_vialidad">Tipo de Vialidad</label>
              <input
                type="text"
                id="tipo_vialidad"
                v-model="formData.tipo_vialidad"
                placeholder="Ej: CALLE"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nombre_vialidad">Nombre de Vialidad</label>
              <input
                type="text"
                id="nombre_vialidad"
                v-model="formData.nombre_vialidad"
                placeholder="Ej: PLAZA 20"
              />
            </div>

            <div class="form-group">
              <label for="numero_exterior">Número Exterior</label>
              <input
                type="text"
                id="numero_exterior"
                v-model="formData.numero_exterior"
                placeholder="Ej: CASA 12"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="numero_interior">Número Interior</label>
              <input
                type="text"
                id="numero_interior"
                v-model="formData.numero_interior"
                placeholder="Opcional"
              />
            </div>

            <div class="form-group">
              <label for="nombre_colonia">Nombre de la Colonia</label>
              <input
                type="text"
                id="nombre_colonia"
                v-model="formData.nombre_colonia"
                placeholder="Ej: CARLOS G FLORES"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nombre_localidad">Nombre de la Localidad</label>
              <input
                type="text"
                id="nombre_localidad"
                v-model="formData.nombre_localidad"
                placeholder="Ej: SALINA CRUZ"
              />
            </div>

            <div class="form-group">
              <label for="nombre_municipio">Nombre del Municipio</label>
              <input
                type="text"
                id="nombre_municipio"
                v-model="formData.nombre_municipio"
                placeholder="Ej: SALINA CRUZ"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nombre_entidad_federativa">Nombre de la Entidad Federativa</label>
              <input
                type="text"
                id="nombre_entidad_federativa"
                v-model="formData.nombre_entidad_federativa"
                placeholder="Ej: OAXACA"
              />
            </div>

            <div class="form-group">
              <label for="entre_calle">Entre Calle</label>
              <input
                type="text"
                id="entre_calle"
                v-model="formData.entre_calle"
                placeholder="Ej: PLAZA 19"
              />
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Guardando...' : (profile ? 'Actualizar' : 'Guardar') }} Perfil
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelEditing">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.my-fiscal-profile {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.profile-view {
  max-width: 900px;
}

.profile-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.profile-section:last-of-type {
  border-bottom: none;
}

.profile-section h3 {
  color: #34495e;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.profile-field label {
  display: block;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.profile-field p {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 500;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
}

.profile-form {
  max-width: 900px;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #34495e;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498db;
}

.constancia-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.constancia-section h3 {
  border-bottom: 2px solid #27ae60;
}

.section-help {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.constancia-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input {
  display: none;
}

.file-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  background-color: #27ae60;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  max-width: 300px;
}

.file-label:hover {
  background-color: #229954;
}

.file-input:disabled + .file-label {
  opacity: 0.6;
  cursor: not-allowed;
}

.constancia-preview {
  max-width: 100%;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 1rem;
}

.constancia-preview img {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background-color: #f5f5f5;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
  font-weight: bold;
}

input,
select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
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
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
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

.error-message pre {
  white-space: pre-wrap;
  margin: 0;
  font-family: inherit;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .form-actions,
  .profile-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
