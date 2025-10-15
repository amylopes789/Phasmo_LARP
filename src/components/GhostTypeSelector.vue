<template>
  <div class="ghost-type-selector-overlay" @click.self="$emit('close')">
    <div class="ghost-type-selector-panel">
      <div class="panel-header">
        <h1>Select Ghost Type</h1>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="polaroid-grid">
        <div 
          v-for="ghost in ghostTypes" 
          :key="ghost.name"
          class="polaroid-wrapper"
          :class="{ selected: ghost.name === selectedGhost }"
        >
          <div 
            class="polaroid"
            :class="{ flipped: flippedGhosts[ghost.name] }"
          >
            <!-- Front of polaroid -->
            <div class="polaroid-face polaroid-front" @click="toggleFlip(ghost.name)">
              <div class="polaroid-image" :style="{ backgroundImage: `url(${getGhostImage(ghost.name)})` }">
              </div>
              <div class="polaroid-caption">
                <div class="ghost-name">{{ ghost.name }}</div>
              </div>
            </div>
            
            <!-- Back of polaroid -->
            <div class="polaroid-face polaroid-back" @click="toggleFlip(ghost.name)">
              <div class="back-content">
                <div class="back-ghost-name">{{ ghost.name }}</div>
                <div class="back-section">
                  <h3>Evidence:</h3>
                  <ul class="back-evidence-list">
                    <li v-for="ev in ghost.evidence" :key="ev">{{ ev }}</li>
                  </ul>
                </div>
                <div class="back-section">
                  <h3>Behavior:</h3>
                  <p class="behavior-text">{{ ghost.behavior }}</p>
                </div>
                <button 
                  @click.stop="selectGhost(ghost.name)"
                  class="select-from-back-btn"
                >
                  Select {{ ghost.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  ghostTypes: {
    type: Array,
    required: true
  },
  selectedGhost: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'close'])

const flippedGhosts = ref({})

const toggleFlip = (ghostName) => {
  // If this ghost is already flipped, just toggle it
  if (flippedGhosts.value[ghostName]) {
    flippedGhosts.value[ghostName] = false
  } else {
    // Flip all other ghosts back to front
    Object.keys(flippedGhosts.value).forEach(key => {
      flippedGhosts.value[key] = false
    })
    // Flip this ghost to back
    flippedGhosts.value[ghostName] = true
  }
}

const selectGhost = (ghostName) => {
  emit('select', ghostName)
  emit('close')
}

const getGhostImage = (ghostName) => {
  // Convert ghost name to filename format (e.g., "The Twins" -> "The_Twins")
  const filename = ghostName.replace(/ /g, '_') + '_Discovered.webp'
  return `/assets/ghost_types/${filename}`
}
</script>

<style scoped>
.ghost-type-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 80px 20px 20px 20px;
  overflow-y: auto;
}

.ghost-type-selector-panel {
  background: #8B7355;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(120, 100, 80, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(120, 100, 80, 0.3) 0%, transparent 50%);
  padding: 40px;
  border-radius: 10px;
  max-width: 1400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.panel-header h1 {
  font-family: 'Creepster', cursive;
  font-size: 2.5rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.close-btn {
  background: white;
  border: 2px solid #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.close-btn:hover {
  background: #ff0844;
  color: white;
  transform: rotate(90deg);
}

.polaroid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 30px;
  padding: 20px;
  align-items: start;
}

.polaroid-wrapper {
  perspective: 1000px;
  height: auto;
}

.polaroid-wrapper:nth-child(4n+1) {
  transform: rotate(-2deg);
}

.polaroid-wrapper:nth-child(4n+2) {
  transform: rotate(1deg);
}

.polaroid-wrapper:nth-child(4n+3) {
  transform: rotate(-1deg);
}

.polaroid-wrapper:nth-child(4n) {
  transform: rotate(2deg);
}

.polaroid-wrapper:hover {
  transform: rotate(0deg) translateY(-10px);
}

.polaroid-wrapper.selected::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  background: #4CAF50;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.polaroid {
  position: relative;
  width: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.polaroid.flipped {
  transform: rotateY(180deg);
}

.polaroid-face {
  backface-visibility: hidden;
  background: white;
  padding: 15px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
}

.polaroid-front {
  padding-bottom: 40px;
  cursor: pointer;
  position: relative;
}

.polaroid-back {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotateY(180deg);
  cursor: pointer;
  min-height: 100%;
  display: flex;
}

.polaroid-image {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  filter: grayscale(100%);
}

.polaroid-caption {
  text-align: center;
}

.ghost-name {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
}

.select-ghost-btn-card {
  width: 100%;
  padding: 12px;
  font-family: 'Permanent Marker', cursive;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid #333;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.select-ghost-btn-card:hover {
  transform: translateY(-2px);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}

/* Back of polaroid */
.back-content {
  padding: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.back-ghost-name {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
}

.back-section {
  margin-bottom: 15px;
  flex-shrink: 0;
}

.back-section h3 {
  font-family: 'Permanent Marker', cursive;
  font-size: 1rem;
  color: #333;
  margin-bottom: 8px;
}

.back-evidence-list {
  font-family: 'Special Elite', cursive;
  margin: 0;
  padding-left: 20px;
  font-size: 0.85rem;
}

.back-evidence-list li {
  margin: 5px 0;
}

.behavior-text {
  font-family: 'Special Elite', cursive;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #555;
  margin: 0;
}

.select-from-back-btn {
  width: 100%;
  padding: 12px;
  font-family: 'Permanent Marker', cursive;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid #333;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: auto;
}

.select-from-back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .polaroid-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }
  
  .panel-header h1 {
    font-size: 1.8rem;
  }
  
  .ghost-name {
    font-size: 1.1rem;
  }
  
  .evidence-list {
    font-size: 0.7rem;
  }
}
</style>

