import { reactive, watch } from 'vue'

const STORAGE_KEY = 'phasmoLARP_state'

// Initialize state from localStorage or defaults
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load state:', error)
  }
  
  return {
    ghostRoom: '',
    selectedGhost: '',
    lightState: 'off',
    upstairsLights: true,
    downstairsLights: true,
    isHunting: false,
    activityLog: [],
    sanity: 100,
    sanityEnabled: false,
    evidenceState: {},
    difficulty: 10 // 1-10 scale, represents X in 10 chance for evidence requests
  }
}

// Save state to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save state:', error)
  }
}

// Shared reactive state
const state = reactive(loadState())

// Watch for changes and save to localStorage
watch(
  () => ({ ...state }),
  (newState) => {
    saveState(newState)
  },
  { deep: true }
)

// Sync state across tabs/windows
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    try {
      const newState = JSON.parse(event.newValue)
      Object.assign(state, newState)
    } catch (error) {
      console.error('Failed to sync state:', error)
    }
  }
})

export function useSharedState() {
  const updateState = (updates) => {
    Object.assign(state, updates)
  }

  const addLog = (message) => {
    const timestamp = new Date()
    const timeString = timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
    
    const log = {
      time: timeString,
      message,
      timestamp: timestamp.toISOString()
    }
    
    // Add to beginning of log
    state.activityLog = [log, ...state.activityLog]
    
    // Keep only last 50 entries
    if (state.activityLog.length > 50) {
      state.activityLog = state.activityLog.slice(0, 50)
    }
  }

  const resetState = () => {
    state.ghostRoom = ''
    state.selectedGhost = ''
    state.lightState = 'on'
    state.upstairsLights = true
    state.downstairsLights = true
    state.isHunting = false
    state.activityLog = []
    state.sanity = 100
    // Note: sanityEnabled and difficulty are NOT reset - those are settings preferences
    state.evidenceState = {}
  }
  
  const drainSanity = (amount) => {
    if (state.sanityEnabled) {
      state.sanity = Math.max(0, state.sanity - amount)
    }
  }

  return {
    state,
    updateState,
    addLog,
    resetState,
    drainSanity
  }
}

