import { useEffect, useRef } from 'react'
import { audioEngine } from '@/audio/AudioEngine'
import type { ColorPalette } from '@/types'

export function Visualizer({
  style,
  palette,
  accentColor,
}: {
  style: 'bars' | 'radial' | 'waveform'
  palette?: ColorPalette
  accentColor: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    let frame = 0
    let width = 0
    let height = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const color = palette?.vibrant ?? accentColor
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * ratio))
      canvas.height = Math.max(1, Math.floor(height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.strokeStyle = color
      context.fillStyle = color
      context.globalAlpha = 0.82
      const analyser = audioEngine.analyser
      if (style === 'waveform') {
        const data = analyser?.getWaveformData() ?? new Uint8Array(128).fill(128)
        context.lineWidth = 2
        context.beginPath()
        data.forEach((value, index) => {
          const x = (index / (data.length - 1)) * width
          const y = height / 2 + ((value - 128) / 128) * height * 0.35
          if (index) context.lineTo(x, y)
          else context.moveTo(x, y)
        })
        context.stroke()
      } else {
        const bands =
          analyser?.getEnergyLevels(style === 'radial' ? 48 : 40) ??
          Array<number>(style === 'radial' ? 48 : 40).fill(0)
        if (style === 'bars') {
          const gap = 2
          const barWidth = (width - gap * (bands.length - 1)) / bands.length
          bands.forEach((energy, index) => {
            const barHeight = Math.max(2, energy * height * 0.9)
            context.fillRect(
              index * (barWidth + gap),
              height - barHeight,
              barWidth,
              barHeight,
            )
          })
        } else {
          const cx = width / 2
          const cy = height / 2
          const radius = Math.min(width, height) * 0.18
          context.lineWidth = 2
          bands.forEach((energy, index) => {
            const angle = (index / bands.length) * Math.PI * 2 - Math.PI / 2
            const outer = radius + Math.max(3, energy * Math.min(width, height) * 0.25)
            context.beginPath()
            context.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
            context.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)
            context.stroke()
          })
        }
      }
      context.globalAlpha = 1
      if (!reducedMotion) frame = requestAnimationFrame(draw)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    draw()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [accentColor, palette?.vibrant, style])

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Visualizer: ${style}`}
      data-visualizer-style={style}
      className="h-full w-full"
    />
  )
}
