<template>
  <div class="room-selector-overlay" @click.self="$emit('close')">
    <div class="room-selector-panel">
      <div class="panel-header">
        <h1>Select Ghost Room</h1>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="polaroid-grid">
        <div 
          v-for="room in rooms" 
          :key="room"
          class="polaroid"
          :class="{ selected: room === selectedRoom }"
          @click="selectRoom(room)"
        >
          <div class="polaroid-image" :style="{ backgroundImage: `url(${getRoomImage(room)})` }">
          </div>
          <div class="polaroid-caption">{{ room }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  rooms: {
    type: Array,
    required: true
  },
  selectedRoom: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'close'])

const selectRoom = (room) => {
  emit('select', room)
  emit('close')
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
</script>

<style scoped>
.room-selector-overlay {
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

.room-selector-panel {
  background: #8B7355;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(120, 100, 80, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(120, 100, 80, 0.3) 0%, transparent 50%);
  padding: 40px;
  border-radius: 10px;
  max-width: 1200px;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  padding: 20px;
}

.polaroid {
  background: white;
  padding: 15px;
  padding-bottom: 50px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  transform: rotate(0deg);
  position: relative;
}

.polaroid:nth-child(3n+1) {
  transform: rotate(-2deg);
}

.polaroid:nth-child(3n+2) {
  transform: rotate(1deg);
}

.polaroid:nth-child(3n) {
  transform: rotate(-1deg);
}

.polaroid:hover {
  transform: rotate(0deg) translateY(-10px) scale(1.05);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.3),
    0 10px 20px rgba(0, 0, 0, 0.2);
}

.polaroid.selected {
  box-shadow: 
    0 0 0 4px #4CAF50,
    0 15px 30px rgba(0, 0, 0, 0.3);
  transform: rotate(0deg) scale(1.08);
}

.polaroid.selected::before {
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
  z-index: 10;
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
  font-family: 'Permanent Marker', cursive;
  font-size: 1.1rem;
  text-align: center;
  color: #333;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .polaroid-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .panel-header h1 {
    font-size: 1.8rem;
  }
}
</style>

