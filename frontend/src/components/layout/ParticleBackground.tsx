import type { Engine } from "@tsparticles/engine"
import Particles, { ParticlesProvider, useParticlesProvider } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

async function initEngine(engine: Engine) {
  await loadSlim(engine)
}

function ParticleLayer() {
  const { loaded } = useParticlesProvider()
  if (!loaded) return null

  return (
    <Particles
      id="tsparticles"
      className="fixed inset-0 -z-10"
      options={{
        fullScreen: { enable: false },
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          number: { value: 50, density: { enable: true } },
          color: { value: ["#10b981", "#14b8a6", "#06b6d4"] },
          opacity: { value: { min: 0.1, max: 0.4 } },
          size: { value: { min: 1, max: 3 } },
          move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            outModes: { default: "out" },
          },
          links: {
            enable: true,
            distance: 150,
            color: "#10b981",
            opacity: 0.08,
            width: 1,
          },
        },
        detectRetina: true,
      }}
    />
  )
}

export function ParticleBackground() {
  return (
    <ParticlesProvider init={initEngine}>
      <ParticleLayer />
    </ParticlesProvider>
  )
}
