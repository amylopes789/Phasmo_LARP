// LIFX API Integration for smart light control

const LIFX_API_BASE = 'https://api.lifx.com/v1'

const DEFAULT_COLORS = {
  ultraWarm: 'kelvin:2500 brightness:0.8',
  red: 'hue:0 saturation:1 brightness:0.8'
}

const getToken = () => import.meta.env.VITE_LIFX_TOKEN || ''

export const isLifxConfigured = () => !!getToken()

const setLightState = async (power, colorString = null) => {
  const token = getToken()
  if (!token) return { success: false, error: 'No token configured' }

  try {
    const body = { power, duration: 0.5 }
    if (colorString) body.color = colorString

    const response = await fetch(`${LIFX_API_BASE}/lights/all/state`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('LIFX API Error:', await response.text())
      return { success: false }
    }

    return { success: true, data: await response.json() }
  } catch (error) {
    console.error('LIFX Request Failed:', error)
    return { success: false, error: error.message }
  }
}

export const turnOn = async () => await setLightState('on', DEFAULT_COLORS.ultraWarm)
export const turnOff = async () => await setLightState('off')
export const turnRed = async () => await setLightState('on', DEFAULT_COLORS.red)
export const restoreDefault = async () => await setLightState('on', DEFAULT_COLORS.ultraWarm)

// Flicker effect
let flickerInterval = null

export const startFlicker = async () => {
  stopFlicker()
  await setLightState('on', DEFAULT_COLORS.ultraWarm)
  
  let isOn = true
  flickerInterval = setInterval(async () => {
    await setLightState(isOn ? 'off' : 'on', isOn ? null : DEFAULT_COLORS.ultraWarm)
    isOn = !isOn
  }, 500)

  return { success: true }
}

export const stopFlicker = () => {
  if (flickerInterval) {
    clearInterval(flickerInterval)
    flickerInterval = null
  }
}

