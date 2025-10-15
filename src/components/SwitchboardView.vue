<template>
  <div class="switchboard-view">
    <button @click="$emit('back')" class="back-btn">← Back</button>
    
    <div class="switchboard-container">
      <div class="polaroid-card switchboard-card">
        <div class="pin"></div>
        <h1 class="switchboard-title">Switchboard Control</h1>

        <div class="switches-grid">
          <!-- Upstairs Lights -->
          <div class="switch-section">
            <div class="switch-container">
              <div class="switch-plate">
                <div class="switch-label-text">UPSTAIRS</div>
                <label class="large-switch">
                  <input 
                    type="checkbox" 
                    v-model="upstairsLights"
                    @change="toggleUpstairs"
                  >
                  <span class="switch-toggle">
                    <span class="switch-inner">
                      <span class="on-label">ON</span>
                      <span class="off-label">OFF</span>
                    </span>
                  </span>
                </label>
                <div class="status-light" :class="{ active: upstairsLights }"></div>
              </div>
            </div>
          </div>

          <!-- Downstairs Lights -->
          <div class="switch-section">
            <div class="switch-container">
              <div class="switch-plate">
                <div class="switch-label-text">DOWNSTAIRS</div>
                <label class="large-switch">
                  <input 
                    type="checkbox" 
                    v-model="downstairsLights"
                    @change="toggleDownstairs"
                  >
                  <span class="switch-toggle">
                    <span class="switch-inner">
                      <span class="on-label">ON</span>
                      <span class="off-label">OFF</span>
                    </span>
                  </span>
                </label>
                <div class="status-light" :class="{ active: downstairsLights }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSharedState } from '../composables/useSharedState'

const { state, updateState, addLog } = useSharedState()

const emit = defineEmits(['back'])

// Local state
const upstairsLights = ref(state.upstairsLights !== undefined ? state.upstairsLights : true)
const downstairsLights = ref(state.downstairsLights !== undefined ? state.downstairsLights : true)

// Methods
const toggleUpstairs = () => {
  updateState({ upstairsLights: upstairsLights.value })
  addLog(`Upstairs lights turned ${upstairsLights.value ? 'ON' : 'OFF'}`)
}

const toggleDownstairs = () => {
  updateState({ downstairsLights: downstairsLights.value })
  addLog(`Downstairs lights turned ${downstairsLights.value ? 'ON' : 'OFF'}`)
}

// Sync with shared state
let syncInterval
onMounted(() => {
  syncInterval = setInterval(() => {
    if (state.upstairsLights !== undefined) {
      upstairsLights.value = state.upstairsLights
    }
    if (state.downstairsLights !== undefined) {
      downstairsLights.value = state.downstairsLights
    }
  }, 500)
})

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval)
})
</script>

<style scoped>
.switchboard-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #333;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Permanent Marker', cursive;
  font-size: 1rem;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 100;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}

.switchboard-container {
  max-width: 900px;
  width: 100%;
}

.polaroid-card {
  background: white;
  padding: 40px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  transform: rotate(-1deg);
  transition: transform 0.3s ease;
}

.polaroid-card:hover {
  transform: rotate(0deg) translateY(-5px);
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

.switchboard-title {
  font-family: 'Permanent Marker', cursive;
  font-size: 2.5rem;
  color: #333;
  text-align: center;
  margin: 0 0 30px 0;
}

.switches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.switch-section {
  background: rgba(0, 0, 0, 0.03);
  padding: 25px;
  border-radius: 10px;
  border: 2px solid #ddd;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.floor-icon {
  font-size: 2rem;
}

.section-label h2 {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.switch-container {
  display: flex;
  justify-content: center;
}

.switch-plate {
  background: linear-gradient(135deg, #ddd 0%, #f0f0f0 100%);
  padding: 20px;
  border-radius: 10px;
  border: 3px solid #999;
  box-shadow: 
    inset 0 2px 5px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  min-width: 200px;
}

.switch-label-text {
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  letter-spacing: 1px;
}

.large-switch {
  cursor: pointer;
  display: block;
}

.large-switch input {
  display: none;
}

.switch-toggle {
  display: block;
  width: 120px;
  height: 60px;
  background: #c0392b;
  border-radius: 30px;
  position: relative;
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.5);
  transition: background 0.3s ease;
  border: 3px solid #333;
}

.large-switch input:checked + .switch-toggle {
  background: #27ae60;
}

.switch-toggle::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #fff 0%, #ddd 100%);
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  border: 2px solid #333;
}

.large-switch input:checked + .switch-toggle::after {
  transform: translateX(62px);
}

.switch-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 15px;
  font-family: 'Permanent Marker', cursive;
  font-size: 0.8rem;
  font-weight: bold;
}

.on-label {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.off-label {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.status-light {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #555;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  border: 2px solid #333;
}

.status-light.active {
  background: #27ae60;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(39, 174, 96, 0.8);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 768px) {
  .switchboard-title {
    font-size: 2rem;
  }
  
  .switches-grid {
    grid-template-columns: 1fr;
  }
}
</style>

