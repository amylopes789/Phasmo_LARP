<template>
    <div class="ghost-controls">
      <button @click="$emit('back')" class="back-btn">← Back</button>
      
      <div class="controls-container">
      <!-- Ghost Room Selection -->
      <div class="room-selection-container">
        <div v-if="!selectedRoom" class="sticky-note">
          <div class="tape"></div>
          <h2>Ghost Room</h2>
          <button @click="showRoomSelector = true" class="select-room-btn">
            Select Ghost Room
          </button>
          <p class="instruction-text">Click to choose the ghost's room</p>
        </div>
        
        <div v-else class="selected-room-polaroid" @click="showRoomSelector = true">
          <div class="polaroid-room">
            <div class="room-image" :style="{ backgroundImage: `url(${getRoomImage(selectedRoom)})` }">
            </div>
            <div class="room-caption">{{ selectedRoom }}</div>
          </div>
          <button @click.stop="clearRoom" class="clear-room-btn" title="Clear selection">✕</button>
        </div>
      </div>
  
      <!-- Ghost Type Selection -->
      <div class="ghost-selection-container">
        <div v-if="!selectedGhost" class="sticky-note">
          <div class="tape"></div>
          <h2>Ghost Type</h2>
          <button @click="showGhostSelector = true" class="select-ghost-btn">
            Select Ghost Type
          </button>
          <p class="instruction-text">Click to choose the ghost type</p>
        </div>
        
        <div v-else class="selected-ghost-polaroid" @click="showGhostSelector = true">
          <div class="polaroid-ghost">
            <div class="ghost-image" :style="{ backgroundImage: `url(${getGhostImage(selectedGhost)})` }">
            </div>
            <div class="ghost-info">
              <div class="ghost-name-caption">{{ selectedGhost }}</div>
            </div>
          </div>
          <button @click.stop="clearGhost" class="clear-ghost-btn" title="Clear selection">✕</button>
        </div>
      </div>

      <!-- Ghost Instructions -->
      <div v-if="selectedGhost" class="lined-paper ghost-instructions">
        <div class="tape"></div>
        <div class="paper-header">
          <h2>{{ selectedGhost }}</h2>
        </div>
        <div class="instructions-content">
          <div class="evidence-section">
            <div class="section-title">Required Evidence:</div>
            <div class="handwritten-list">
              <div v-for="ev in getGhostEvidence(selectedGhost)" :key="ev" class="handwritten-evidence-item">
                • {{ ev }}
              </div>
            </div>
          </div>
          <div class="behavior-section">
            <div class="section-title">Behavior:</div>
            <div class="handwritten-text">
              {{ getGhostBehavior(selectedGhost) }}
            </div>
          </div>
          <div class="actions-section">
            <div class="section-title">What to do:</div>
            <div class="handwritten-list">
              <div v-for="instruction in getGhostInstructions(selectedGhost)" :key="instruction" class="handwritten-item">
                • {{ instruction }}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Action Buttons -->
      <div class="polaroid-card action-card">
        <div class="pin"></div>
        <h2>Ghost Actions</h2>
        
        <!-- Light Controls -->
        <div class="light-controls-section">
          <h3>Smart Light Controls</h3>
          <div class="light-buttons">
            <button 
              @click="setLight('on')" 
              class="light-btn light-on-btn"
              :class="{ active: lightState === 'on' }"
              :disabled="isHunting"
            >
              ON
            </button>
            <button 
              @click="setLight('off')" 
              class="light-btn light-off-btn"
              :class="{ active: lightState === 'off' }"
              :disabled="isHunting"
            >
              OFF
            </button>
            <button 
              @click="setLight('flicker')" 
              class="light-btn light-flicker-btn"
              :class="{ active: lightState === 'flicker' }"
              :disabled="isHunting"
            >
              FLICKER
            </button>
          </div>
          <div class="light-status">
            Status: {{ getLightStatusText() }}
            <span v-if="isHunting" class="hunt-notice">⚠️ Disabled during hunt</span>
          </div>
        </div>

        <div class="divider"></div>

        <button 
          @click="triggerInteraction" 
          class="action-btn interaction-btn"
          :disabled="!canTriggerInteraction"
        >
          Interact
        </button>
        <div v-if="interactionCooldown > 0" class="cooldown-timer">
          Cooldown: {{ interactionCooldown }}s
        </div>

        <button 
          @click="toggleHunt" 
          class="action-btn hunt-btn"
          :class="{ 'hunt-active': isHunting }"
          :disabled="!canTriggerHunt"
        >
          {{ isHunting ? 'Cancel Hunt' : 'Hunt' }}
        </button>
        <div v-if="huntCooldown > 0" class="cooldown-timer">
          Cooldown: {{ huntCooldown }}s
        </div>
      </div>
  
      <!-- Activity Log -->
      <div class="sticky-note activity-log">
        <div class="tape"></div>
        <div class="log-header">
          <h2>Activity Log</h2>
          <button @click="clearLogs" class="clear-logs-btn" v-if="activityLog.length > 0">
            Clear
          </button>
        </div>
        <div class="log-entries">
          <div v-for="(log, index) in activityLog" :key="index" class="log-entry">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="activityLog.length === 0" class="no-logs">
            No activities yet...
          </div>
        </div>
      </div>
    </div>
    
    <!-- Room Selector Modal -->
    <RoomSelector 
      v-if="showRoomSelector"
      :rooms="rooms"
      :selectedRoom="selectedRoom"
      @select="handleRoomSelect"
      @close="showRoomSelector = false"
    />
    
    <!-- Ghost Type Selector Modal -->
    <GhostTypeSelector 
      v-if="showGhostSelector"
      :ghostTypes="ghostTypes"
      :selectedGhost="selectedGhost"
      @select="handleGhostSelect"
      @close="showGhostSelector = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSharedState } from '../composables/useSharedState'
import RoomSelector from './RoomSelector.vue'
import GhostTypeSelector from './GhostTypeSelector.vue'
import * as lifx from '../utils/lifx'
  
  const { state, updateState, addLog, drainSanity } = useSharedState()
  
  const emit = defineEmits(['back'])
  
// Room options
const rooms = [
  'Living Room',
  'Kitchen',
  'Garage',
  'Nursery',
  'Main Bedroom',
  'Bedroom w/ Ensuite',
  'Bathroom'
]
  
// Ghost types with their evidence and behavior
const ghostTypes = [
  { name: 'Spirit', evidence: ['EMF 5', 'Spirit Box', 'Ghost Writing'], behavior: 'No special strengths or weaknesses. Very common.' },
  { name: 'Wraith', evidence: ['EMF 5', 'Spirit Box', 'D.O.T.S.'], behavior: 'Never touches the ground. Cannot track with footsteps.' },
  { name: 'Phantom', evidence: ['Spirit Box', 'UV', 'D.O.T.S.'], behavior: 'Disappears when photographed.' },
  { name: 'Poltergeist', evidence: ['Spirit Box', 'UV', 'Ghost Writing'], behavior: 'Throws multiple objects at once. Very active.' },
  { name: 'Banshee', evidence: ['UV', 'Ghost Orbs', 'D.O.T.S.'], behavior: 'Targets one person at a time. Screams a lot. Scared of Crucifixes.' },
  { name: 'Jinn', evidence: ['EMF 5', 'UV', 'Freezing'], behavior: 'Moves faster when far from target.' },
  { name: 'Mare', evidence: ['Spirit Box', 'Ghost Orbs', 'Ghost Writing'], behavior: 'Prefers darkness. Hunts earlier in dark.' },
  { name: 'Revenant', evidence: ['Ghost Orbs', 'Ghost Writing', 'Freezing'], behavior: 'Extremely fast during hunts. Slow if your hiding.' },
  { name: 'Shade', evidence: ['EMF 5', 'Ghost Writing', 'Freezing'], behavior: 'Shy ghost. Less active when people are nearby.' },
  { name: 'Demon', evidence: ['UV', 'Ghost Writing', 'Freezing'], behavior: 'Very aggressive. Can hunt at high sanity.' },
  { name: 'Yurei', evidence: ['Ghost Orbs', 'Freezing', 'D.O.T.S.'], behavior: 'Drains sanity faster. Can close doors.' },
  { name: 'Oni', evidence: ['EMF 5', 'Freezing', 'D.O.T.S.'], behavior: 'Very active. More visible and aggressive with groups.' },
  { name: 'Yokai', evidence: ['Spirit Box', 'Ghost Orbs', 'D.O.T.S.'], behavior: 'Only hears voices nearby. More active when talking.' },
  { name: 'Hantu', evidence: ['UV', 'Ghost Orbs', 'Freezing'], behavior: 'Moves faster in the cold.' },
  { name: 'Goryo', evidence: ['EMF 5', 'UV', 'D.O.T.S.'], behavior: 'They are rarely seen far from their place of death.' },
  { name: 'Myling', evidence: ['EMF 5', 'UV', 'Ghost Writing'], behavior: 'Very vocal and active but very quiet during hunts.' },
  { name: 'Onryo', evidence: ['Spirit Box', 'Ghost Orbs', 'Freezing'], behavior: 'This ghost is afraid of fire.' },
  { name: 'The Twins', evidence: ['EMF 5', 'Spirit Box', 'Freezing'], behavior: 'Can interact in two locations. One fast, one slow.' },
  { name: 'Raiju', evidence: ['EMF 5', 'Ghost Orbs', 'D.O.T.S.'], behavior: 'Speeds up near electronics. Disrupts equipment.' },
  { name: 'Obake', evidence: ['EMF 5', 'UV', 'Ghost Orbs'], behavior: 'Can leave six-fingered prints. May not leave evidence.' },
  { name: 'The Mimic', evidence: ['Spirit Box', 'UV', 'Freezing'], behavior: 'Mimics other ghost behaviors. Shows fake Ghost Orbs.' },
  { name: 'Moroi', evidence: ['Spirit Box', 'Ghost Writing', 'Freezing'], behavior: 'Speeds up with low sanity. Drains sanity faster.' },
  { name: 'Deogen', evidence: ['Spirit Box', 'Ghost Writing', 'D.O.T.S.'], behavior: 'Always knows location. Slow when close, fast when far.' },
  { name: 'Thaye', evidence: ['Ghost Orbs', 'Ghost Writing', 'D.O.T.S.'], behavior: 'Very active in the beginning, becomes less active over time.' }
]
  
// Local state
const selectedRoom = ref(state.ghostRoom || '')
const selectedGhost = ref(state.selectedGhost || '')
const lightState = ref(state.lightState || 'off')
const interactionCooldown = ref(0)
const huntCooldown = ref(0)
const isHunting = ref(state.isHunting || false)
const activityLog = ref(state.activityLog || [])
const showRoomSelector = ref(false)
const showGhostSelector = ref(false)
let huntTimeout = null
let huntCooldownInterval = null
  
// Computed
const canTriggerInteraction = computed(() => interactionCooldown.value === 0 && selectedRoom.value && selectedGhost.value)
const canTriggerHunt = computed(() => huntCooldown.value === 0 && selectedRoom.value && selectedGhost.value)
  
  // Methods
const getGhostEvidence = (ghostName) => {
  const ghost = ghostTypes.find(g => g.name === ghostName)
  return ghost ? ghost.evidence : []
}

const getGhostBehavior = (ghostName) => {
  const ghost = ghostTypes.find(g => g.name === ghostName)
  return ghost ? ghost.behavior : ''
}

const getGhostInstructions = (ghostName) => {
  const evidence = getGhostEvidence(ghostName)
  const instructions = []
  
  // Evidence-specific instructions
  if (evidence.includes('EMF 5')) {
    instructions.push('Use the Interact button to trigger an EMF Level 5 reading in the Ghost Room')
  }
  if (evidence.includes('D.O.T.S.')) {
    instructions.push('Your D.O.T.S. Vest will turn on if a D.O.T.S. projector is nearby and active.')
  }
  if (evidence.includes('UV')) {
    instructions.push('Place fingerprints and footprints on walls, doors, floors, or switches in the Ghost Room')
  }
  if (evidence.includes('Ghost Orbs')) {
    instructions.push('Place the Ghost Orb device inside the Ghost Room')
  }
  if (evidence.includes('Ghost Writing')) {
    instructions.push('Write in the Notebook if it has been placed in the Ghost Room, only possible during hunts')
  }
  if (evidence.includes('Spirit Box')) {
    instructions.push('Speak into your Spirit Box when Investigators ask you questions through it')
  }
  if (evidence.includes('Freezing')) {
    instructions.push('Use the Interact button to trigger a Freezing Temperature reading in the Ghost Room')
  }
  
  // Always include these
  instructions.push('Control the lights to create fear')
  instructions.push('Hunt to leave your ghost area and attack Investigators')
  
  return instructions
}
  
const handleRoomSelect = (room) => {
  selectedRoom.value = room
  updateState({ ghostRoom: room })
  addLog(`Ghost room set to: ${room}`)
}

const clearRoom = () => {
  selectedRoom.value = ''
  updateState({ ghostRoom: '' })
  addLog('Ghost room cleared')
}

const getRoomImage = (room) => {
  const base = import.meta.env.BASE_URL
  const images = {
    'Living Room': `${base}assets/ghost_rooms/living_room.jpg`,
    'Kitchen': `${base}assets/ghost_rooms/kitchen.jpg`,
    'Garage': `${base}assets/ghost_rooms/garage.jpg`,
    'Nursery': `${base}assets/ghost_rooms/nursery.jpg`,
    'Main Bedroom': `${base}assets/ghost_rooms/main_bedroom.jpg`,
    'Bedroom w/ Ensuite': `${base}assets/ghost_rooms/bedoom_ensuite.jpg`,
    'Bathroom': `${base}assets/ghost_rooms/bathroom.jpg`
  }
  return images[room] || `${base}assets/ghost_rooms/living_room.jpg`
}

const getGhostImage = (ghostName) => {
  // Convert ghost name to filename format (e.g., "The Twins" -> "The_Twins")
  const filename = ghostName.replace(/ /g, '_') + '_Discovered.webp'
  const base = import.meta.env.BASE_URL
  return `${base}assets/ghost_types/${filename}`
}

const handleGhostSelect = (ghostName) => {
  selectedGhost.value = ghostName
  updateState({ selectedGhost: ghostName })
  addLog(`Ghost type set to: ${ghostName}`)
}

const clearGhost = () => {
  selectedGhost.value = ''
  updateState({ selectedGhost: '' })
  addLog('Ghost type cleared')
}

const clearLogs = () => {
  activityLog.value = []
  updateState({ activityLog: [] })
}

const setLight = async (state) => {
  // Stop any existing flicker first
  if (lightState.value === 'flicker') {
    lifx.stopFlicker()
  }
  
  lightState.value = state
  updateState({ lightState: state })
  
  const messages = {
    on: 'Smart light turned ON',
    off: 'Smart light turned OFF',
    flicker: 'Smart light set to FLICKER'
  }
  
  addLog(messages[state] || `Light state: ${state}`)
  
  // Control LIFX lights if configured
  if (lifx.isLifxConfigured()) {
    try {
      if (state === 'on') {
        const result = await lifx.turnOn()
        if (result.success) {
          console.log('LIFX lights turned ON')
        }
      } else if (state === 'off') {
        const result = await lifx.turnOff()
        if (result.success) {
          console.log('LIFX lights turned OFF')
        }
      } else if (state === 'flicker') {
        await lifx.startFlicker()
        console.log('LIFX lights set to FLICKER')
      }
    } catch (error) {
      console.error('LIFX control error:', error)
    }
  } else {
    console.log('LIFX not configured - lights control is simulated only')
  }
  
  sendPostMessage({
    type: 'smart_light',
    action: state,
    room: selectedRoom.value
  })
}

const getLightStatusText = () => {
  const statuses = {
    on: 'Lights are ON',
    off: 'Lights are OFF',
    flicker: 'Lights are FLICKERING'
  }
  return statuses[lightState.value] || 'Unknown'
}
  
const triggerInteraction = () => {
  if (!canTriggerInteraction.value) return
  
  const interactions = [
    'Door slam',
    'Object thrown',
    'Light flicker',
    'EMF spike',
    'Temperature drop',
    'Spirit Box response',
    'Ghost Writing appeared',
    'D.O.T.S. manifestation',
    'UV fingerprints left',
    'Ghost Orb detected'
  ]
  
  const interaction = interactions[Math.floor(Math.random() * interactions.length)]
  addLog(`Ghost interaction: ${interaction}`)
  
  // Drain sanity (doubled for Yurei and Moroi)
  const baseDrain = 5
  const drainAmount = (selectedGhost.value === 'Yurei' || selectedGhost.value === 'Moroi') ? baseDrain * 2 : baseDrain
  drainSanity(drainAmount)
  
  // Only apply cooldown if sanity is enabled
  if (state.sanityEnabled) {
    // Calculate cooldown based on sanity (10s at 100%, 5s at 0%)
    const baseCooldown = 10
    const sanityMultiplier = state.sanity / 100
    const cooldown = Math.max(5, Math.round(baseCooldown * sanityMultiplier))
    
    // Start cooldown
    interactionCooldown.value = cooldown
    const interval = setInterval(() => {
      interactionCooldown.value--
      if (interactionCooldown.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  }
  
  // Send POST messages
  const postData = {
    interaction: interaction,
    room: selectedRoom.value,
    ghost: selectedGhost.value,
    timestamp: new Date().toISOString()
  }
  
  // Always send /interact request
  sendPostMessage('/interact', postData)
  
  // Get current ghost's evidence
  const currentGhost = ghostTypes.find(g => g.name === selectedGhost.value)
  if (currentGhost) {
    // Send /emf if ghost has EMF Level 5
    if (currentGhost.evidence.includes('EMF 5')) {
      sendPostMessage('/emf', postData)
    }
    
    // Send /freeze if ghost has Freezing Temperatures
    if (currentGhost.evidence.includes('Freezing')) {
      sendPostMessage('/freeze', postData)
    }
  }
}
  
// Helper function to start hunt cooldown
const startHuntCooldown = () => {
  // Always apply cooldown if sanity is enabled, unless ghost is Demon
  if (state.sanityEnabled && selectedGhost.value !== 'Demon') {
    // Start cooldown (double the interact cooldown)
    const baseCooldown = 20 // Base is 20 seconds (double of interact's 10)
    const sanityMultiplier = state.sanity / 100
    const cooldown = Math.max(10, Math.round(baseCooldown * sanityMultiplier))
    
    huntCooldown.value = cooldown
    if (huntCooldownInterval) {
      clearInterval(huntCooldownInterval)
    }
    huntCooldownInterval = setInterval(() => {
      huntCooldown.value--
      if (huntCooldown.value <= 0) {
        clearInterval(huntCooldownInterval)
        huntCooldownInterval = null
      }
    }, 1000)
  }
}

const toggleHunt = async () => {
  if (isHunting.value) {
    // Cancel hunt
    isHunting.value = false
    updateState({ isHunting: false })
    addLog('Hunt cancelled')
    
    // Clear the timeout if it exists
    if (huntTimeout) {
      clearTimeout(huntTimeout)
      huntTimeout = null
    }
    
    // Restore LIFX lights to default Ultra Warm and set light state to ON
    lightState.value = 'on'
    updateState({ lightState: 'on' })
    
    if (lifx.isLifxConfigured()) {
      try {
        await lifx.restoreDefault()
        console.log('LIFX lights restored to default Ultra Warm')
      } catch (error) {
        console.error('LIFX restore error:', error)
      }
    }
    
    // Apply cooldown after cancelling
    startHuntCooldown()
    
    // Send POST message
    sendPostMessage('/hunt', {
      action: 'cancel',
      room: selectedRoom.value,
      ghost: selectedGhost.value,
      timestamp: new Date().toISOString()
    })
  } else {
    // Start hunt
    isHunting.value = true
    updateState({ isHunting: true })
    addLog(`HUNT STARTED in ${selectedRoom.value}`)
    
    // Stop any flicker effect
    lifx.stopFlicker()
    
    // Set LIFX lights to RED for hunt
    if (lifx.isLifxConfigured()) {
      try {
        await lifx.turnRed()
        console.log('LIFX lights set to RED for hunt')
      } catch (error) {
        console.error('LIFX hunt color error:', error)
      }
    }
    
    // Drain sanity (doubled for Yurei and Moroi)
    const baseDrain = 15
    const drainAmount = (selectedGhost.value === 'Yurei' || selectedGhost.value === 'Moroi') ? baseDrain * 2 : baseDrain
    drainSanity(drainAmount)
    
    // Hunt lasts 60 seconds
    huntTimeout = setTimeout(async () => {
      isHunting.value = false
      updateState({ isHunting: false })
      addLog('Hunt ended')
      huntTimeout = null
      
      // Restore LIFX lights to default Ultra Warm and set light state to ON
      lightState.value = 'on'
      updateState({ lightState: 'on' })
      
      if (lifx.isLifxConfigured()) {
        try {
          await lifx.restoreDefault()
          console.log('LIFX lights restored to default Ultra Warm after hunt')
        } catch (error) {
          console.error('LIFX restore error:', error)
        }
      }
      
      // Apply cooldown after hunt ends
      startHuntCooldown()
    }, 60000)
    
    // Send POST message
    sendPostMessage('/hunt', {
      action: 'start',
      room: selectedRoom.value,
      ghost: selectedGhost.value,
      duration: 60,
      timestamp: new Date().toISOString()
    })
  }
}
  
const sendPostMessage = async (endpoint, data) => {
  console.log(`POST Message to ${endpoint}:`, data)
  
  const serverIP = localStorage.getItem('server_ip')
  if (!serverIP) {
    console.log('No server IP configured. Skipping POST request.')
    return
  }
  
  try {
    let baseUrl = serverIP.startsWith('http') ? serverIP : `http://${serverIP}`
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '')
    const url = `${baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      console.log(`✅ POST to ${endpoint} successful`)
    } else {
      console.warn(`⚠️ POST to ${endpoint} failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.warn(`❌ POST to ${endpoint} error:`, error.message)
  }
}
  
  // Sync with shared state
  let syncInterval
  onMounted(() => {
    syncInterval = setInterval(() => {
      activityLog.value = state.activityLog || []
      isHunting.value = state.isHunting || false
    }, 500)
  })
  
onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval)
  if (huntTimeout) clearTimeout(huntTimeout)
  if (huntCooldownInterval) clearInterval(huntCooldownInterval)
  lifx.stopFlicker() // Stop any active flicker effect
})
  </script>
  
  <style scoped>
  .ghost-controls {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 80px 20px 20px 20px;
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
  
  .controls-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }
  
  .sticky-note {
    background: white;
    padding: 25px;
    box-shadow: 
      0 3px 6px rgba(0, 0, 0, 0.16),
      0 3px 6px rgba(0, 0, 0, 0.23);
    position: relative;
    min-height: 250px;
    transform: rotate(var(--rotation, 1deg));
    transition: transform 0.3s ease;
  }
  
  .sticky-note:nth-child(odd) {
    --rotation: -1deg;
  }
  
  .sticky-note:nth-child(even) {
    --rotation: 2deg;
  }
  
  .sticky-note:hover {
    transform: rotate(0deg) translateY(-5px);
    box-shadow: 
      0 10px 20px rgba(0, 0, 0, 0.19),
      0 6px 6px rgba(0, 0, 0, 0.23);
  }
  
  .tape {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 25px;
    background: rgba(255, 255, 255, 0.3);
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .sticky-note h2 {
    font-family: 'Permanent Marker', cursive;
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #333;
  }
  
  .select-dropdown {
    width: 100%;
    padding: 12px;
    font-family: 'Special Elite', cursive;
    font-size: 1rem;
    border: 2px solid #333;
    border-radius: 5px;
    background: white;
    cursor: pointer;
    margin-bottom: 15px;
  }
  
  .selected-info {
    font-family: 'Special Elite', cursive;
    font-size: 1.1rem;
    color: #333;
    margin-top: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 5px;
  }
  
  .evidence-list {
    margin-top: 15px;
    font-family: 'Special Elite', cursive;
    font-size: 0.9rem;
    color: #555;
  }
  
  .evidence-list small {
    display: block;
    margin: 3px 0;
  }
  
/* Light Controls in Action Card */
.light-controls-section {
  margin-bottom: 20px;
}

.light-controls-section h3 {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.light-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.light-btn {
  padding: 15px 10px;
  font-family: 'Permanent Marker', cursive;
  font-size: 1rem;
  border: 3px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  background: white;
  color: #333;
}

.light-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.light-on-btn {
  border-color: #ffd700;
}

.light-on-btn:hover {
  background: #fff9e6;
  transform: translateY(-2px);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}

.light-on-btn.active {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  font-weight: bold;
}

.light-off-btn {
  border-color: #6c757d;
}

.light-off-btn:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}

.light-off-btn.active {
  background: linear-gradient(135deg, #6c757d 0%, #8a8a8a 100%);
  color: white;
  font-weight: bold;
}

.light-flicker-btn {
  border-color: #ff8c00;
}

.light-flicker-btn:hover {
  background: #fff0f0;
  transform: translateY(-2px);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}

.light-flicker-btn.active {
  background: white;
  color: #333;
  font-weight: bold;
  animation: flickerOrange 0.5s infinite;
}

.light-flicker-btn.active:disabled {
  animation: none;
  background: white;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes flickerOrange {
  0%, 100% { 
    background: white;
    box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
  }
  50% { 
    background: #ff8c00;
    color: white;
    box-shadow: 0 0 20px rgba(255, 165, 0, 0.8);
  }
}

.light-status {
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
}

.hunt-notice {
  display: block;
  color: #ff0844;
  font-weight: bold;
  margin-top: 5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #333, transparent);
  margin: 25px 0;
}
  
  .polaroid-card {
    background: white;
    padding: 30px;
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
  
.action-card {
  grid-column: 1 / -1;
}
  
  .action-card h2 {
    font-family: 'Permanent Marker', cursive;
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
  
  .action-btn {
    width: 100%;
    padding: 20px;
    font-family: 'Permanent Marker', cursive;
    font-size: 1.3rem;
    border: 3px solid #333;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 15px;
    transition: all 0.3s ease;
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
  }
  
.interaction-btn {
  background: white;
  color: #333;
}
  
  .interaction-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  }
  
.hunt-btn {
  background: #ff0844;
  color: white;
}

.hunt-btn.hunt-active {
  background: #dc3545;
  animation: pulse 1s infinite;
}
  
.hunt-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
}
  
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
.cooldown-timer {
  font-family: 'Special Elite', cursive;
  text-align: center;
  color: #666;
  margin-bottom: 15px;
  font-size: 0.9rem;
}
  
.activity-log {
  grid-column: 1 / -1;
  max-height: 400px;
  overflow-y: auto;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.log-header h2 {
  margin: 0;
}

.clear-logs-btn {
  font-family: 'Permanent Marker', cursive;
  font-size: 0.9rem;
  padding: 8px 15px;
  background: #ff6b6b;
  color: white;
  border: 2px solid #333;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.clear-logs-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}
  
  .log-entries {
    font-family: 'Special Elite', cursive;
    font-size: 0.9rem;
  }
  
  .log-entry {
    padding: 8px;
    border-bottom: 1px dashed #333;
    display: flex;
    gap: 10px;
  }
  
  .log-time {
    color: #666;
    font-weight: bold;
    min-width: 60px;
  }
  
  .log-message {
    color: #333;
  }
  
.no-logs {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

/* Room Selection Styles */
.room-selection-container {
  position: relative;
}

.select-room-btn {
  width: 100%;
  padding: 20px;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
}

.select-room-btn:hover {
  transform: translateY(-3px);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
}

.instruction-text {
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin: 0;
  font-style: italic;
}

.selected-room-polaroid {
  background: white;
  padding: 15px;
  padding-bottom: 50px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  transform: rotate(-2deg);
  position: relative;
  max-width: 300px;
}

.selected-room-polaroid:hover {
  transform: rotate(0deg) translateY(-5px);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.3),
    0 10px 20px rgba(0, 0, 0, 0.2);
}

.polaroid-room {
  position: relative;
}

.room-image {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  filter: grayscale(100%);
}

.room-caption {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.2rem;
  text-align: center;
  color: #333;
  word-wrap: break-word;
}

.clear-room-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff0844;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.clear-room-btn:hover {
  background: #dc3545;
  transform: rotate(90deg) scale(1.1);
}

/* Ghost Type Selection Styles */
.ghost-selection-container {
  position: relative;
}

.select-ghost-btn {
  width: 100%;
  padding: 20px;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
}

.select-ghost-btn:hover {
  transform: translateY(-3px);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
}

.selected-ghost-polaroid {
  background: white;
  padding: 15px;
  padding-bottom: 40px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  transform: rotate(1deg);
  position: relative;
  max-width: 300px;
}

.selected-ghost-polaroid:hover {
  transform: rotate(0deg) translateY(-5px);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.3),
    0 10px 20px rgba(0, 0, 0, 0.2);
}

.polaroid-ghost {
  position: relative;
}

.ghost-image {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  filter: grayscale(100%);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.ghost-info {
  text-align: center;
}

.ghost-name-caption {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.ghost-evidence-list {
  font-family: 'Special Elite', cursive;
  font-size: 0.85rem;
  color: #555;
  text-align: left;
  padding: 0 10px;
}

.evidence-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.evidence-detail {
  margin: 3px 0;
  line-height: 1.4;
}

.clear-ghost-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff0844;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.clear-ghost-btn:hover {
  background: #dc3545;
  transform: rotate(90deg) scale(1.1);
}

/* Ghost Instructions - Lined Paper */
.lined-paper {
  background: 
    linear-gradient(to bottom, transparent 24px, #94D1F0 24px, #94D1F0 25px, transparent 25px),
    linear-gradient(to right, #FFE5E5 0px, #FFE5E5 40px, white 40px);
  background-size: 100% 25px, 100% 100%;
  background-position: 0 0, 0 0;
  padding: 25px 25px 25px 60px;
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.16),
    0 3px 6px rgba(0, 0, 0, 0.23);
  position: relative;
  transform: rotate(-1deg);
  transition: transform 0.3s ease;
  min-height: 300px;
}

.lined-paper:hover {
  transform: rotate(0deg) translateY(-5px);
  box-shadow: 
    0 10px 20px rgba(0, 0, 0, 0.19),
    0 6px 6px rgba(0, 0, 0, 0.23);
}

.lined-paper .tape {
  left: 45px;
}

.paper-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #94D1F0;
}

.paper-header h2 {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.instructions-content {
  font-family: 'Permanent Marker', cursive;
  font-size: 0.95rem;
  color: #1a1a1a;
  line-height: 25px;
}

.evidence-section,
.behavior-section,
.actions-section {
  margin-bottom: 20px;
}

.section-title {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.1rem;
  color: #000;
  margin-bottom: 8px;
  font-weight: bold;
  text-decoration: underline;
}

.handwritten-list {
  margin: 0;
  padding-left: 10px;
}

.handwritten-item {
  margin: 8px 0;
  line-height: 23px;
  color: #1a1a1a;
  font-family: 'Special Elite', cursive;
}

.handwritten-evidence-item {
  margin: 8px 0;
  line-height: 17px;
  color: #1a1a1a;
  font-family: 'Special Elite', cursive;
}

.handwritten-text {
  margin: 8px 0;
  line-height: 25px;
  color: #1a1a1a;
  font-style: normal;
  font-family: 'Special Elite', cursive;
}
</style>
  