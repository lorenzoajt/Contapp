<script setup>
import { ref, watch } from 'vue'
import { fiscalProfileService } from '../services/fiscalProfile'

const props = defineProps({
  editProfile: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['profile-saved', 'cancel'])

const formData = ref({
  // Datos de Identificación del Contribuyente
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

  // Datos del domicilio registrado
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

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

// Watch for edit profile changes
watch(() => props.editProfile, (newProfile) => {
  if (newProfile) {
    formData.value = {
      rfc: newProfile.rfc || '',
      curp: newProfile.curp || '',
      nombre: newProfile.nombre || '',
      primer_apellido: newProfile.primer_apellido || '',
      segundo_apellido: newProfile.segundo_apellido || '',
      persona: newProfile.persona || 'FISICA',
      regimen_fiscal: newProfile.regimen_fiscal || '605',
      fecha_inicio_operaciones: newProfile.fecha_inicio_operaciones || '',
      estatus_padron: newProfile.estatus_padron || '',
      fecha_ultimo_cambio_estado: newProfile.fecha_ultimo_cambio_estado || '',
      nombre_comercial: newProfile.nombre_comercial || '',
      codigo_postal: newProfile.codigo_postal || '',
      tipo_vialidad: newProfile.tipo_vialidad || '',
      nombre_vialidad: newProfile.nombre_vialidad || '',
      numero_exterior: newProfile.numero_exterior || '',
      numero_interior: newProfile.numero_interior || '',
      nombre_colonia: newProfile.nombre_colonia || '',
      nombre_localidad: newProfile.nombre_localidad || '',
      nombre_municipio: newProfile.nombre_municipio || '',
      nombre_entidad_federativa: newProfile.nombre_entidad_federativa || '',
      entre_calle: newProfile.entre_calle || ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!formData.value.nombre || !formData.value.rfc) {
    error.value = 'Por favor complete los campos obligatorios: Nombre y RFC'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (props.editProfile?.id) {
      await fiscalProfileService.update(props.editProfile.id, formData.value)
    } else {
      await fiscalProfileService.create(formData.value)
    }

    submitted.value = true
    setTimeout(() => {
      emit('profile-saved')
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
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
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
  }
  error.value = ''
  submitted.value = false
}

const cancel = () => {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <div class="fiscal-form">
    <div v-if="!submitted" class="form-container">
      <h2>{{ editProfile ? 'Editar' : 'Registro de' }} Perfil Fiscal</h2>

      <div v-if="error" class="error-message">
        <pre>{{ error }}</pre>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Datos de Identificación del Contribuyente -->
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

        <!-- Datos del Domicilio Registrado -->
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
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="numero_exterior">Número Exterior</label>
              <input
                type="text"
                id="numero_exterior"
                v-model="formData.numero_exterior"
                placeholder="Ej: CASA 12"
              />
            </div>

            <div class="form-group">
              <label for="numero_interior">Número Interior</label>
              <input
                type="text"
                id="numero_interior"
                v-model="formData.numero_interior"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nombre_colonia">Nombre de la Colonia</label>
              <input
                type="text"
                id="nombre_colonia"
                v-model="formData.nombre_colonia"
                placeholder="Ej: CARLOS G FLORES"
              />
            </div>

            <div class="form-group">
              <label for="nombre_localidad">Nombre de la Localidad</label>
              <input
                type="text"
                id="nombre_localidad"
                v-model="formData.nombre_localidad"
                placeholder="Ej: SALINA CRUZ"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nombre_municipio">Nombre del Municipio o Demarcación Territorial</label>
              <input
                type="text"
                id="nombre_municipio"
                v-model="formData.nombre_municipio"
                placeholder="Ej: SALINA CRUZ"
              />
            </div>

            <div class="form-group">
              <label for="nombre_entidad_federativa">Nombre de la Entidad Federativa</label>
              <input
                type="text"
                id="nombre_entidad_federativa"
                v-model="formData.nombre_entidad_federativa"
                placeholder="Ej: OAXACA"
              />
            </div>
          </div>

          <div class="form-row">
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
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : (editProfile ? 'Actualizar' : 'Guardar') }} Perfil Fiscal
          </button>
          <button type="button" class="btn btn-secondary" @click="cancel">
            {{ editProfile ? 'Cancelar' : 'Limpiar' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Success Message -->
    <div v-else class="success-container">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <h2>Perfil Fiscal {{ editProfile ? 'Actualizado' : 'Guardado' }} Exitosamente</h2>
        <p>Redirigiendo a la lista de perfiles...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fiscal-form {
  width: 100%;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.75rem;
}

.form-section {
  margin-bottom: 2.5rem;
}

.form-section h3 {
  color: #34495e;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498db;
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

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.error-message pre {
  white-space: pre-wrap;
  margin: 0;
  font-family: inherit;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

input::placeholder {
  color: #999;
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

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.success-card {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 800px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto 1.5rem;
}

.submitted-data {
  text-align: left;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.submitted-data h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.data-section {
  margin-bottom: 2rem;
}

.data-section h4 {
  color: #34495e;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.data-section p {
  margin: 0.5rem 0;
  color: #555;
}

.data-section strong {
  color: #2c3e50;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
