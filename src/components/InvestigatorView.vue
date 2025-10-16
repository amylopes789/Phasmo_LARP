<template>
  <div class="investigator-view">
    <button @click="$emit('back')" class="back-btn">← Back</button>
    
    <!-- Sanity Bar -->
    <div v-if="state.sanityEnabled" class="sanity-bar-container">
      <div class="sanity-bar-label">
        <span class="sanity-title">Sanity Level</span>
        <span class="sanity-percentage">{{ Math.round(sanity) }}%</span>
      </div>
      <div class="sanity-bar-outer">
        <div 
          class="sanity-bar-inner" 
          :style="{ width: sanity + '%' }"
          :class="getSanityClass()"
        ></div>
      </div>
    </div>
    
    <div class="investigator-container">
      <!-- Evidence Tracker -->
      <div class="polaroid-card evidence-card">
        <div class="pin"></div>
        <h2>Evidence Tracker</h2>
        <div class="evidence-grid">
          <button 
            v-for="evidence in evidenceTypes" 
            :key="evidence.name"
            class="evidence-item"
            :class="{ 
              'confirmed': evidenceState[evidence.name] === 'confirmed',
              'ruled-out': evidenceState[evidence.name] === 'ruled-out'
            }"
            @click="cycleEvidence(evidence.name)"
          >
            <div class="evidence-icon" :style="{ backgroundImage: `url(${evidence.image})` }"></div>
            <div class="evidence-label">{{ evidence.name }}</div>
          </button>
        </div>
      </div>

      <!-- Possible Ghosts List -->
      <div class="sticky-note ghosts-list full-width">
        <div class="tape"></div>
        <h2>Possible Ghosts</h2>
        <div class="ghost-count">
          {{ possibleGhosts.length }} of {{ allGhosts.length }} ghosts possible
        </div>
        <div class="ghosts-container">
          <div 
            v-for="ghost in possibleGhosts" 
            :key="ghost.name"
            class="ghost-entry"
          >
            <div class="ghost-header">
              <div class="ghost-name">{{ ghost.name }}</div>
            </div>
            <div class="ghost-evidence">
              <span 
                v-for="ev in ghost.evidence" 
                :key="ev"
                class="evidence-tag"
                :class="{
                  'confirmed': evidenceState[ev] === 'confirmed',
                  'ruled-out': evidenceState[ev] === 'ruled-out'
                }"
              >
                {{ ev }}
              </span>
            </div>
            <div class="ghost-behavior">{{ ghost.behavior }}</div>
          </div>
          <div v-if="possibleGhosts.length === 0" class="no-ghosts">
            No ghosts match the current evidence
          </div>
        </div>
      </div>

      <!-- Hunt Alert -->
      <div v-if="isHunting" class="hunt-alert">
        <div class="pin"></div>
        <div class="alert-content">
          🚨 HUNT IN PROGRESS 🚨
          <div class="alert-subtitle">Hide and stay quiet!</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSharedState } from '../composables/useSharedState'

const { state, updateState } = useSharedState()

const emit = defineEmits(['back'])

// Evidence types with images
const base = import.meta.env.BASE_URL
const evidenceTypes = [
  { name: 'EMF 5', image: `${base}assets/evidence/emf.webp` },
  { name: 'D.O.T.S.', image: `${base}assets/evidence/dots.webp` },
  { name: 'UV', image: `${base}assets/evidence/uv.webp` },
  { name: 'Ghost Orbs', image: `${base}assets/evidence/ghost_orbs.webp` },
  { name: 'Ghost Writing', image: `${base}assets/evidence/ghost_writing.webp` },
  { name: 'Spirit Box', image: `${base}assets/evidence/spirit_box.webp` },
  { name: 'Freezing', image: `${base}assets/evidence/thermometer.webp` }
]

// All ghosts with their evidence and behavior
const allGhosts = [
  { name: 'Spirit', evidence: ['EMF 5', 'Spirit Box', 'Ghost Writing'], behavior: 'No special strengths or weaknesses. Very common.' },
  { name: 'Wraith', evidence: ['EMF 5', 'Spirit Box', 'D.O.T.S.'], behavior: 'Never touches the ground. Cannot track with footsteps.' },
  { name: 'Phantom', evidence: ['Spirit Box', 'UV', 'D.O.T.S.'], behavior: 'Disappears when photographed. Drains sanity faster.' },
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
  { name: 'Moroi', evidence: ['Spirit Box', 'Ghost Writing', 'Freezing'], behavior: 'Speeds up with low sanity. Curses through Spirit Box.' },
  { name: 'Deogen', evidence: ['Spirit Box', 'Ghost Writing', 'D.O.T.S.'], behavior: 'Always knows location. Slow when close, fast when far.' },
  { name: 'Thaye', evidence: ['Ghost Orbs', 'Ghost Writing', 'D.O.T.S.'], behavior: 'Very active in the beginning, becomes less active over time.' }
]

// Local state
const evidenceState = computed(() => state.evidenceState)
const isHunting = ref(false)
const sanity = ref(state.sanity || 100)

// Initialize evidence states if not already set
if (!state.evidenceState || Object.keys(state.evidenceState).length === 0) {
  const initialState = {}
  evidenceTypes.forEach(ev => {
    initialState[ev.name] = null
  })
  state.evidenceState = initialState
}

// Computed
const possibleGhosts = computed(() => {
  const confirmed = Object.keys(evidenceState.value).filter(
    ev => evidenceState.value[ev] === 'confirmed'
  )
  const ruledOut = Object.keys(evidenceState.value).filter(
    ev => evidenceState.value[ev] === 'ruled-out'
  )

  return allGhosts.filter(ghost => {
    // Ghost must have all confirmed evidence
    const hasAllConfirmed = confirmed.every(ev => ghost.evidence.includes(ev))
    
    // Ghost must not have any ruled-out evidence
    const hasNoRuledOut = !ruledOut.some(ev => ghost.evidence.includes(ev))
    
    return hasAllConfirmed && hasNoRuledOut
  })
})

// Methods
const cycleEvidence = (evidence) => {
  const current = state.evidenceState[evidence]
  const newState = { ...state.evidenceState }
  
  if (current === null) {
    newState[evidence] = 'confirmed'
  } else if (current === 'confirmed') {
    newState[evidence] = 'ruled-out'
  } else {
    newState[evidence] = null
  }
  
  updateState({ evidenceState: newState })
}

const getSanityClass = () => {
  if (sanity.value > 60) return 'sanity-high'
  if (sanity.value > 30) return 'sanity-medium'
  return 'sanity-low'
}

// Sync with shared state
let syncInterval
onMounted(() => {
  syncInterval = setInterval(() => {
    isHunting.value = state.isHunting || false
    sanity.value = state.sanity || 100
  }, 500)
})

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval)
})
</script>

<style scoped>
.investigator-view {
  width: 100%;
  max-width: 1600px;
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

.investigator-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 20px;
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

.evidence-card {
  grid-column: 1 / -1;
}

.evidence-card h2 {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.evidence-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f8f8;
  border: 3px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-family: 'Special Elite', cursive;
}

.evidence-item:hover {
  transform: translateY(-3px);
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
}

.evidence-item.confirmed {
  background: #d4edda;
  border-color: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
}

.evidence-item.ruled-out {
  background: #f8d7da;
  border-color: #dc3545;
  opacity: 0.7;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.3);
}

.evidence-icon {
  width: 60px;
  height: 60px;
  min-width: 60px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.evidence-label {
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
  flex: 1;
}

.evidence-item.ruled-out .evidence-label {
  text-decoration: line-through;
}

.sticky-note {
  background: white;
  padding: 25px;
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.16),
    0 3px 6px rgba(0, 0, 0, 0.23);
  position: relative;
  transition: transform 0.3s ease;
  transform: rotate(var(--rotation, 1deg));
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

.ghost-count {
  font-family: 'Special Elite', cursive;
  font-size: 1rem;
  color: #666;
  margin-bottom: 15px;
  font-weight: bold;
}

.ghosts-container {
  max-height: 500px;
  overflow-y: auto;
}

.ghost-entry {
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 2px solid #333;
}

.ghost-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ghost-name {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.2rem;
  color: #333;
}

.ghost-behavior {
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  color: #1a1a1a;
  margin-top: 10px;
  font-style: normal;
  line-height: 16px;
  padding: 6px 10px 10px 25px;
  background: 
    linear-gradient(to bottom, transparent 16px, #94D1F0 16px, #94D1F0 17px, transparent 17px),
    linear-gradient(to right, #FFE5E5 0px, #FFE5E5 20px, white 20px);
  background-size: 100% 17px, 100% 100%;
  background-position: 0 0, 0 0;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ghost-evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.evidence-tag {
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  padding: 4px 8px;
  background: #e0e0e0;
  border-radius: 4px;
  color: #333;
}

.evidence-tag.confirmed {
  background: #28a745;
  color: white;
}

.evidence-tag.ruled-out {
  background: #dc3545;
  color: white;
  text-decoration: line-through;
}

.no-ghosts {
  text-align: center;
  color: #999;
  padding: 30px;
  font-family: 'Special Elite', cursive;
  font-style: italic;
}

.full-width {
  grid-column: 1 / -1;
}

.hunt-alert {
  grid-column: 1 / -1;
  background: white;
  padding: 30px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  transform: rotate(0deg);
}

.alert-content {
  background: #ff0844;
  color: white;
  padding: 30px;
  text-align: center;
  font-family: 'Permanent Marker', cursive;
  font-size: 2rem;
  border-radius: 8px;
  animation: pulse 1s infinite;
  margin-top: 20px
}

.alert-subtitle {
  font-size: 1.3rem;
  margin-top: 10px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Sanity Bar */
.sanity-bar-container {
  background: white;
  padding: 20px;
  margin: 0 0 20px 0;
  border-radius: 8px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  transform: rotate(-0.5deg);
}

.sanity-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sanity-title {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.3rem;
  color: #333;
}

.sanity-percentage {
  font-family: 'Special Elite', cursive;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.sanity-bar-outer {
  width: 100%;
  height: 40px;
  background: #e0e0e0;
  border-radius: 20px;
  overflow: hidden;
  border: 3px solid #333;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sanity-bar-inner {
  height: 100%;
  transition: width 0.5s ease, background 0.5s ease;
  border-radius: 20px;
}

.sanity-high {
  background: linear-gradient(90deg, #4CAF50 0%, #81C784 100%);
}

.sanity-medium {
  background: linear-gradient(90deg, #FFC107 0%, #FFD54F 100%);
}

.sanity-low {
  background: linear-gradient(90deg, #f44336 0%, #e57373 100%);
  animation: pulse 1s infinite;
}
</style>

