# Phasmophobia LARP - Quick Overview

## What Is This?
A complete web application for running Phasmophobia-themed Live Action Roleplay events. Provides synchronized interfaces for ghost players and investigators using a cork board aesthetic with polaroid photos and sticky notes.

## Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3001
```

## Three Interfaces

### 👻 Ghost Interface
Control the paranormal activity:
- Select room and ghost type using polaroid photos
- Trigger interactions and hunts
- Control smart lights (ON/OFF/FLICKER)
- View evidence-specific instructions on lined paper
- Track all actions in activity log

### 🔦 Investigator Interface  
Track evidence and identify the ghost:
- Mark evidence as confirmed or ruled out
- See filtered list of possible ghosts
- View ghost behaviors on lined paper notes
- Monitor sanity level (optional)
- Get alerts during hunts

### ⚡ Switchboard
Control venue lighting:
- Toggle upstairs lights
- Toggle downstairs lights
- Visual status indicators

## Key Features

### Visual Design
- Cork board background texture
- White sticky notes with tape
- Polaroid photos (black & white filtered)
- Lined paper for notes
- Authentic handwritten fonts

### Sanity System (Optional)
- Drains during ghost activities
- Affects cooldown times
- Color-coded visual bar
- Toggle on/off in settings

### Smart Cooldowns
When sanity is enabled:
- Interact: 10s → 5s (scales with sanity)
- Hunt: 20s → 10s (only on cancel, scales with sanity)

When sanity is disabled:
- No cooldowns
- Unlimited use

### Real-Time Sync
- All devices share state via localStorage
- Updates every 500ms
- Persists across page refreshes

## Rooms (7 Total)
Living Room • Kitchen • Garage • Nursery • Main Bedroom • Bedroom w/ Ensuite • Bathroom

## Ghosts (24 Total)
Spirit • Wraith • Phantom • Poltergeist • Banshee • Jinn • Mare • Revenant • Shade • Demon • Yurei • Oni • Yokai • Hantu • Goryo • Myling • Onryo • The Twins • Raiju • Obake • The Mimic • Moroi • Deogen • Thaye

## Evidence Types (7 Total)
📡 EMF 5 • 🔴 D.O.T.S. • 👆 UV • ⚪ Ghost Orbs • 📝 Ghost Writing • 📻 Spirit Box • ❄️ Freezing

## Tech Stack
Vue 3 • Vite 7 • CSS3 • localStorage

## File Structure
```
src/
├── components/      # 5 Vue components
├── composables/     # Shared state logic
├── styles/          # Global CSS
└── App.vue          # Main entry

assets/
├── ghost_rooms/     # 7 room photos
└── ghost_types/     # 24 ghost images
```

## Development Tips

### Hot Reload
- Vite provides instant hot reload
- Changes appear immediately in browser
- State persists during development

### Multi-Device Testing
1. Start dev server
2. Open on multiple devices on same network
3. Use network URL (shown in terminal)
4. Test state synchronization

### Debugging
- All actions logged to console
- POST messages logged (ready for backend)
- Activity log shows all ghost actions
- Use browser DevTools to inspect state

## Customization Points

### Easy Changes
- Room list and images
- Ghost behaviors and evidence
- Cooldown durations
- Sanity drain amounts
- Color schemes

### Medium Changes
- Add new evidence types
- Modify UI layouts
- Add sound effects
- Change fonts

### Advanced Changes
- WebSocket integration for real-time sync
- Backend API for game state
- Admin interface for game master
- Session recording/playback
- Timer systems

## Production Deployment
1. `npm run build` - Creates optimized production build
2. Deploy `dist/` folder to web server
3. Ensure assets are accessible
4. Test on actual devices
5. Configure any necessary CORS headers

## Performance Notes
- Images lazy load as needed
- CSS animations use GPU acceleration
- Minimal JavaScript for fast load times
- localStorage is fast and local
- No external API calls required

## Accessibility
- Keyboard navigation supported
- High contrast mode compatible
- Screen reader friendly labels
- Focus indicators on interactive elements
- Mobile responsive design

## Best Practices for LARP Events

### Before Event
1. Test on actual devices
2. Verify WiFi/network connectivity (for multi-tab sync)
3. Pre-load all rooms and ghost images
4. Decide if sanity system should be enabled
5. Brief players on interface usage

### During Event
1. Ghost player selects room and type first
2. Investigators start with neutral evidence
3. Ghost triggers interactions strategically
4. Switchboard operator creates atmosphere
5. Monitor sanity levels (if enabled)

### After Event
1. Review activity log for highlights
2. Note any technical issues
3. Gather player feedback
4. Clear state for next session (refresh page)

## Troubleshooting

**Issue**: Images not loading
- Check `/assets/` folder structure
- Verify image paths match exactly
- Check browser console for 404 errors

**Issue**: State not syncing between devices
- Ensure localStorage is enabled
- Check if devices are on same network (not required but helpful for multi-device setup)
- Verify 500ms sync interval is running

**Issue**: Cooldowns not working
- Check if sanity system is enabled
- Verify cooldown logic in triggerInteraction() and toggleHunt()
- Check browser console for errors

**Issue**: Polaroids not flipping
- Verify CSS 3D transforms are supported
- Check browser compatibility
- Test in Chrome/Edge for best support

## Version History

### v1.0.0 - Initial Release
- Three interfaces (Ghost, Investigator, Switchboard)
- 7 rooms with real photos
- 24 ghost types with images
- Flippable polaroid cards
- Sanity system with dynamic cooldowns
- Evidence tracking with 3-state buttons
- Lined paper aesthetic for notes
- Complete state synchronization

## Contributing
This is a custom LARP application. Modifications should maintain the Phasmophobia aesthetic and LARP functionality.

## License
Fan project for LARP events. Phasmophobia is created by Kinetic Games.
