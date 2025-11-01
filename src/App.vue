<template>
  <div class="app-container">
    <div class="role-selector" v-if="!selectedRole">
      <div class="title-card polaroid-card">
        <h1 class="title">Phasmophobia LARP</h1>
        <p class="subtitle">Select Your Role</p>
      </div>
      
      <div class="roles-grid">
        <div class="role-polaroid ghost-polaroid" @click="selectRole('ghost')">
          <div class="polaroid-photo ghost-photo" :style="{ backgroundImage: `url(${ghostPhotoUrl})` }"></div>
          <div class="polaroid-label">Ghost</div>
        </div>
        
        <div class="role-polaroid investigator-polaroid" @click="selectRole('investigator')">
          <div class="polaroid-photo investigator-photo" :style="{ backgroundImage: `url(${investigatorPhotoUrl})` }"></div>
          <div class="polaroid-label">Investigator</div>
        </div>
      </div>
      
      <div class="switchboard-card polaroid-card">
        <div class="pin"></div>
        <div class="switchboard-btn-container" style="padding-top: 20px;">
          <button @click="selectRole('switchboard')" class="switchboard-btn">
            Switchboard Control
          </button>
        </div>
      </div>
      
      <div class="settings-card polaroid-card">
        <div class="pin"></div>
        <h3 class="settings-title">Game Settings</h3>
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="sanityEnabled"
              @change="toggleSanity"
              class="setting-checkbox"
            >
            <span class="setting-text">Enable Sanity System</span>
          </label>
          <p class="setting-description">
            When enabled, investigator sanity drains during ghost activities and affects cooldown times
          </p>
        </div>
        <div class="setting-item">
          <div class="setting-label-slider">
            <span class="setting-text">Evidence Difficulty: {{ difficulty }}/10</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            v-model.number="difficulty"
            @input="updateDifficulty"
            class="difficulty-slider"
          >
          <p class="setting-description">
            Controls the chance of EMF and Freezing evidence appearing ({{ difficulty }} in 10 chance per interaction)
          </p>
        </div>
        <div class="setting-item">
          <button @click="showLifxSettings = true" class="lifx-settings-btn">
            💡 Configure Connections
          </button>
          <p class="setting-description">
            {{ lifxStatus }}
          </p>
        </div>
        <div class="setting-item">
          <button @click="resetGame" class="reset-game-btn">
            🔄 Reset Game
          </button>
          <p class="setting-description">
            Clear all game state and start fresh
          </p>
        </div>
      </div>
    </div>

    <GhostControls v-else-if="selectedRole === 'ghost'" @back="selectedRole = null" />
    <InvestigatorView v-else-if="selectedRole === 'investigator'" @back="selectedRole = null" />
    <SwitchboardView v-else-if="selectedRole === 'switchboard'" @back="selectedRole = null" />
    
    <LifxSettings v-if="showLifxSettings" @close="showLifxSettings = false" @saved="checkLifxStatus" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import GhostControls from './components/GhostControls.vue'
import InvestigatorView from './components/InvestigatorView.vue'
import SwitchboardView from './components/SwitchboardView.vue'
import LifxSettings from './components/LifxSettings.vue'
import { useSharedState } from './composables/useSharedState'
import * as lifx from './utils/lifx'

const { state, updateState, resetState } = useSharedState()

const selectedRole = ref(null)
const sanityEnabled = ref(state.sanityEnabled || false)
const difficulty = ref(state.difficulty || 10)
const showLifxSettings = ref(false)
const lifxConfigured = ref(false)

// Asset URLs with base path
const base = import.meta.env.BASE_URL
const ghostPhotoUrl = `${base}assets/ghost.webp`
const investigatorPhotoUrl = `${base}assets/investigator.webp`

const lifxStatus = computed(() => {
  return lifxConfigured.value 
    ? '✅ LIFX Connected' 
    : 'Click to connect your LIFX smart lights (optional)'
})

const checkLifxStatus = () => {
  lifxConfigured.value = !!localStorage.getItem('lifx_token')
}

onMounted(() => {
  checkLifxStatus()
})

const selectRole = (role) => {
  selectedRole.value = role
}

const toggleSanity = () => {
  updateState({ sanityEnabled: sanityEnabled.value })
  if (!sanityEnabled.value) {
    updateState({ sanity: 100 })
  }
}

const updateDifficulty = () => {
  updateState({ difficulty: difficulty.value })
}

const resetGame = async () => {
  if (confirm('Are you sure you want to reset the entire game? This will clear all progress.')) {
    // Stop any flicker effect
    lifx.stopFlicker()
    
    // Reset all game state
    resetState()
    
    // Turn lights to default ON state if LIFX is configured
    if (lifx.isLifxConfigured()) {
      try {
        await lifx.turnOn()
        console.log('LIFX lights reset to default Ultra Warm')
      } catch (error) {
        console.error('LIFX reset error:', error)
      }
    }
    
    console.log('Game reset complete')
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.role-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.title-card {
  max-width: 500px;
  width: 100%;
}

.polaroid-card {
  background: white;
  padding: 40px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  transform: rotate(-1deg);
  position: relative;
  transition: transform 0.3s ease;
}

.polaroid-card:hover {
  transform: rotate(0deg) translateY(-5px);
}

.title-card::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #8B4513 40%, transparent 40%);
  border-radius: 50%;
}

.pin {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #8B4513 50%, #654321 100%);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.title {
  font-family: 'Creepster', cursive;
  font-size: 3rem;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.5rem;
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  width: 100%;
}

.role-polaroid {
  background: white;
  padding: 15px;
  padding-bottom: 50px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.ghost-polaroid {
  transform: rotate(-2deg);
}

.investigator-polaroid {
  transform: rotate(2deg);
}

.role-polaroid:hover {
  transform: rotate(0deg) translateY(-10px) scale(1.05);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.3),
    0 10px 20px rgba(0, 0, 0, 0.2);
}

.polaroid-photo {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  filter: grayscale(100%);
}

.ghost-photo {
  background-size: cover;
  background-position: center;
}

.investigator-photo {
  background-size: cover;
  background-position: center;
}

.polaroid-label {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.2rem;
  text-align: center;
  color: #333;
  word-wrap: break-word;
}

.switchboard-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  text-align: center;
}

.switchboard-btn {
  width: 100%;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.3rem;
  padding: 20px 30px;
  border: 3px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
  color: #333;
}

.switchboard-btn:hover {
  transform: translateY(-3px);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
}

/* Settings Card */
.settings-card {
  width: 100%;
  max-width: 500px;
  padding: 25px;
}

.settings-title {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 8px;
}

.setting-label-slider {
  margin-bottom: 12px;
}

.setting-checkbox {
  width: 24px;
  height: 24px;
  cursor: pointer;
  accent-color: #667eea;
}

.setting-text {
  font-family: 'Special Elite', cursive;
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
}

.difficulty-slider {
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: linear-gradient(to right, #ff0844 0%, #ffd700 50%, #4CAF50 100%);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin-bottom: 8px;
}

.difficulty-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid #333;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.difficulty-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

.difficulty-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid #333;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.difficulty-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

.setting-description {
  font-family: 'Special Elite', cursive;
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  padding-left: 36px;
  line-height: 1.4;
  font-style: italic;
}

.lifx-settings-btn {
  width: 100%;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.1rem;
  padding: 15px 20px;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 8px;
}

.lifx-settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #45a049 0%, #4CAF50 100%);
}

.reset-game-btn {
  width: 100%;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.1rem;
  padding: 15px 20px;
  border: 2px solid #ff0844;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ff0844 0%, #cc0036 100%);
  color: white;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 8px;
}

.reset-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #cc0036 0%, #ff0844 100%);
}
</style>

