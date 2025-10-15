# Phasmophobia LARP Application

A web-based interface for running a Live Action Roleplay event based on the Phasmophobia video game. Features an authentic cork board aesthetic with white sticky notes, polaroid photos, and lined paper for an immersive ghost-hunting experience.

## 🎮 Features

### Three Distinct Interfaces

#### 👻 Ghost Interface
- **Polaroid Room Selection** - Choose from 7 rooms using actual venue photos in black & white
- **Polaroid Ghost Type Selection** - Browse 24 ghost types with flippable polaroids showing evidence and behavior on the back
- **Smart Light Controls** - Three-state control (ON, OFF, FLICKER) with visual feedback
- **Ghost Interaction Trigger** - Random paranormal events with dynamic cooldowns
- **Hunt Mode** - 30-second hunts with toggle on/off capability and cooldown when cancelled
- **Lined Paper Instructions** - Dynamic instructions based on selected ghost's evidence
- **Activity Log** - Complete history of all ghost actions with clear function

#### 🔦 Investigator Interface
- **Evidence Tracker** - Large icon-based buttons with 3-state cycle (Neutral → Confirmed → Ruled Out)
- **Dynamic Ghost Filtering** - Automatically narrows down possibilities based on evidence
- **Ghost Behavior Notes** - Each ghost shows behavior on lined paper background
- **Sanity System** - Visual sanity bar that drains during ghost activities (optional feature)
- **Hunt Alerts** - Full-screen warnings when hunts are active

#### ⚡ Switchboard Interface
- **Upstairs/Downstairs Controls** - Large physical-style toggle switches
- **Status Indicators** - Glowing lights showing current state
- **Cork Board Aesthetic** - Matches the rest of the application

### 🎨 Design Features
- **Cork board background** with realistic texture
- **White sticky notes** with tape effects and subtle rotation
- **Polaroid photos** with actual room and ghost images (black & white filtered)
- **Lined paper** for handwritten notes effect
- **Push pins** on polaroid cards
- **Flippable ghost polaroids** - Click to see evidence and behavior on the back
- **Fonts**: Creepster, Permanent Marker, Special Elite
- **Responsive design** for mobile and desktop

### 🎯 Sanity System (Optional)
- **Visual sanity bar** with color-coded levels (Green → Yellow → Red)
- **Dynamic cooldowns** that scale with sanity:
  - Interact: 10s @ 100% sanity → 5s @ 0% sanity
  - Hunt: 20s @ 100% sanity → 10s @ 0% sanity
- **Sanity drain**:
  - Interact action: -5% sanity
  - Hunt action: -15% sanity
- **Special ghost abilities**:
  - **Yurei & Moroi**: Double sanity drain (-10% interact, -30% hunt)
  - **Demon**: No hunt cooldown after canceling
- **Toggle on/off** from the main menu settings

### 🔄 Real-Time Synchronization
- **localStorage-based** state management
- **Cross-device/tab sync** (500ms updates)
- **Event logging** for all activities
- **Persistent state** across page refreshes

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open in browser:**
```
http://localhost:3001
```

## 🎭 Usage Guide

### Setup
1. Open the application on multiple devices
2. One device for Ghost player
3. Multiple devices for Investigators
4. Optional device for Switchboard operator
5. Configure Sanity System from main menu (optional)

### Ghost Player Instructions
1. **Select Room**: Click to browse polaroid photos of venue rooms
2. **Select Ghost**: Click polaroids to flip and see evidence/behavior, then select
3. **View Instructions**: Lined paper shows evidence-specific actions and general tips
4. **Control Lights**: Toggle between ON, OFF, and FLICKER states
5. **Trigger Interactions**: Random paranormal events (cooldown scales with sanity)
6. **Manage Hunts**: Start 30-second hunts or cancel early (cooldown on cancel only)

### Investigator Instructions
1. **Track Evidence**: Click evidence buttons to cycle through states
   - First click: Green (Confirmed)
   - Second click: Red with strikethrough (Ruled Out)
   - Third click: Neutral (reset)
2. **Review Possible Ghosts**: Filtered list shows matching ghosts with behavior notes
3. **Monitor Sanity**: Watch the sanity bar (if enabled) - lower sanity means faster ghost
4. **Watch for Hunts**: Full-screen alert appears during active hunts

### Switchboard Operator
1. Toggle **Upstairs Lights** on/off
2. Toggle **Downstairs Lights** on/off
3. Monitor glowing status indicators

## 🏠 Venue Rooms
1. Living Room
2. Kitchen
3. Garage
4. Nursery
5. Main Bedroom
6. Bedroom w/ Ensuite
7. Bathroom

## 👻 Ghost Types (24 Total)
Spirit, Wraith, Phantom, Poltergeist, Banshee, Jinn, Mare, Revenant, Shade, Demon, Yurei, Oni, Yokai, Hantu, Goryo, Myling, Onryo, The Twins, Raiju, Obake, The Mimic, Moroi, Deogen, Thaye

## 🔍 Evidence Types
- 📡 EMF Level 5
- 🔴 D.O.T.S. Projector
- 👆 Ultraviolet (UV Fingerprints)
- ⚪ Ghost Orbs
- 📝 Ghost Writing
- 📻 Spirit Box
- ❄️ Freezing Temperatures

## 🛠️ Technical Stack
- **Vue 3** - Composition API
- **Vite 7** - Build tool
- **CSS3** - Custom styling with animations
- **localStorage** - State persistence

## 📁 Project Structure
```
PhasmoLARP/
├── public/
│   └── assets/
│       ├── evidence/             # Evidence type images
│       ├── ghost_rooms/          # Venue room photos
│       └── ghost_types/          # Ghost character images
├── src/
│   ├── components/
│   │   ├── GhostControls.vue        # Ghost player interface
│   │   ├── InvestigatorView.vue     # Investigator interface
│   │   ├── SwitchboardView.vue      # Light control interface
│   │   ├── RoomSelector.vue         # Room selection modal
│   │   └── GhostTypeSelector.vue    # Ghost selection modal
│   ├── composables/
│   │   └── useSharedState.js        # Shared state management
│   ├── styles/
│   │   └── main.css                 # Global styles
│   ├── App.vue                       # Main app with role selection
│   └── main.js                       # Entry point
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Pages deployment
├── index.html
├── vite.config.js
└── package.json
```

## 🚀 Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

**Setup Instructions:**

1. Push your code to GitHub
2. Go to your repository settings
3. Navigate to **Pages** (under "Code and automation")
4. Under **Source**, select "GitHub Actions"
5. Push to the `main` branch to trigger automatic deployment

Your site will be available at: `https://<your-username>.github.io/Phasmo_LARP/`

### Local Build

**Build for Production:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run preview
```

## 🌐 Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📝 License
This is a fan project for LARP events based on Phasmophobia by Kinetic Games.

## 🙏 Credits
- Inspired by **Phasmophobia** by Kinetic Games
- Created for Live Action Roleplay events
- Ghost images and game data from Phasmophobia
