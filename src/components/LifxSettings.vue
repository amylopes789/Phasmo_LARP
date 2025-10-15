<template>
  <div class="lifx-settings-overlay" @click.self="$emit('close')">
    <div class="lifx-settings-panel">
      <div class="panel-header">
        <h2>LIFX Smart Lights Setup</h2>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <div class="settings-content">
        <div class="info-card">
          <h3>📱 How to Get Your Token</h3>
          <ol>
            <li>Go to <a href="https://cloud.lifx.com/settings" target="_blank">cloud.lifx.com/settings</a></li>
            <li>Log in with your LIFX account</li>
            <li>Click "Generate New Token"</li>
            <li>Copy the token and paste it below</li>
          </ol>
        </div>

        <div class="token-input-section">
          <label for="lifx-token">LIFX Token:</label>
          <input
            id="lifx-token"
            v-model="token"
            type="password"
            placeholder="Paste your LIFX token here"
            class="token-input"
          />
          <button @click="toggleShowToken" class="show-btn">
            {{ showToken ? '🙈 Hide' : '👁️ Show' }}
          </button>
        </div>

        <div class="button-group">
          <button @click="saveToken" class="save-btn" :disabled="!token.trim()">
            💾 Save Token
          </button>
          <button @click="testConnection" class="test-btn" v-if="hasToken">
            🔌 Test Connection
          </button>
          <button @click="clearToken" class="clear-btn" v-if="hasToken">
            🗑️ Clear Token
          </button>
        </div>

        <div v-if="statusMessage" class="status-message" :class="statusType">
          {{ statusMessage }}
        </div>

        <div class="security-note">
          <strong>🔒 Security:</strong> Your token is stored locally in your browser only. 
          It never leaves your device and is not sent to any server except LIFX.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close', 'saved'])

const token = ref('')
const showToken = ref(false)
const hasToken = ref(false)
const statusMessage = ref('')
const statusType = ref('')

const STORAGE_KEY = 'lifx_token'

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    token.value = saved
    hasToken.value = true
  }
})

const toggleShowToken = () => {
  showToken.value = !showToken.value
  const input = document.getElementById('lifx-token')
  input.type = showToken.value ? 'text' : 'password'
}

const saveToken = () => {
  const trimmed = token.value.trim()
  if (!trimmed) return

  localStorage.setItem(STORAGE_KEY, trimmed)
  hasToken.value = true
  
  showStatus('✅ Token saved successfully!', 'success')
  
  // Reload to apply token
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

const clearToken = () => {
  if (confirm('Are you sure you want to remove your LIFX token?')) {
    localStorage.removeItem(STORAGE_KEY)
    token.value = ''
    hasToken.value = false
    showStatus('Token cleared', 'info')
    
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
}

const testConnection = async () => {
  showStatus('Testing connection...', 'info')
  
  try {
    const response = await fetch('https://api.lifx.com/v1/lights/all', {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    if (response.ok) {
      const lights = await response.json()
      showStatus(`✅ Connected! Found ${lights.length} light(s)`, 'success')
    } else {
      showStatus('❌ Connection failed. Check your token.', 'error')
    }
  } catch (error) {
    showStatus('❌ Network error. Check your connection.', 'error')
  }
}

const showStatus = (message, type) => {
  statusMessage.value = message
  statusType.value = type
  
  setTimeout(() => {
    statusMessage.value = ''
  }, 5000)
}
</script>

<style scoped>
.lifx-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.lifx-settings-panel {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.panel-header {
  background: #4CAF50;
  color: white;
  padding: 20px;
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.5rem;
}

.close-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
}

.close-btn:hover {
  background: #ff0844;
  color: white;
  transform: rotate(90deg);
}

.settings-content {
  padding: 30px;
}

.info-card {
  background: #f0f8ff;
  border-left: 4px solid #4CAF50;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 8px;
}

.info-card h3 {
  margin-top: 0;
  font-family: 'Permanent Marker', cursive;
  color: #333;
}

.info-card ol {
  margin: 10px 0;
  padding-left: 20px;
}

.info-card li {
  margin: 8px 0;
  font-family: 'Special Elite', monospace;
}

.info-card a {
  color: #4CAF50;
  font-weight: bold;
  text-decoration: none;
}

.info-card a:hover {
  text-decoration: underline;
}

.token-input-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.token-input-section label {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.1rem;
  color: #333;
  min-width: 100px;
}

.token-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.token-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.show-btn {
  padding: 12px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Permanent Marker', cursive;
  transition: all 0.3s ease;
}

.show-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.save-btn, .test-btn, .clear-btn {
  padding: 15px 25px;
  border: none;
  border-radius: 10px;
  font-family: 'Permanent Marker', cursive;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 150px;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.test-btn {
  background: #2196F3;
  color: white;
}

.test-btn:hover {
  background: #0b7dda;
  transform: translateY(-2px);
}

.clear-btn {
  background: #ff0844;
  color: white;
}

.clear-btn:hover {
  background: #cc0036;
  transform: translateY(-2px);
}

.status-message {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: 'Special Elite', monospace;
  font-weight: bold;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.security-note {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Special Elite', monospace;
  font-size: 0.9rem;
  color: #856404;
}

@media (max-width: 768px) {
  .token-input-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .save-btn, .test-btn, .clear-btn {
    width: 100%;
  }
}
</style>

