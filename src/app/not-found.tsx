'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useI18n } from '@/components/i18n-provider'
import { useTheme } from '@/components/theme-provider'

export default function NotFound() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener('resize', resize)

    // Particle system
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
    }> = []

    const colors = isDark
      ? ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
      : ['#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24']

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    let animationId: number

    const animate = () => {
      // Clear canvas with theme-appropriate background
      ctx.fillStyle = isDark ? 'rgba(17, 24, 39, 0.05)' : 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Draw connections
        particles.forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            const alpha = 0.2 * (1 - distance / 150)
            ctx.strokeStyle = isDark
              ? `rgba(100, 100, 100, ${alpha})`
              : `rgba(150, 150, 150, ${alpha})`
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [isDark])

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[calc(100vh-64px-56px)] flex items-center justify-center overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className={`text-9xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          404
        </h1>
        <p className={`text-2xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('pageNotFound') || '页面未找到'}
        </p>
        <p className={`mb-8 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('pageNotFoundDesc') || '抱歉，您访问的页面不存在或已被移除。'}
        </p>
        <Link
          href="/"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t('backToHome') || '返回首页'}
        </Link>
      </div>

      {/* Floating elements */}
      <div className={`absolute top-20 left-20 w-20 h-20 rounded-full blur-xl animate-pulse ${isDark ? 'bg-blue-500/20' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-20 right-20 w-32 h-32 rounded-full blur-xl animate-pulse delay-1000 ${isDark ? 'bg-purple-500/20' : 'bg-purple-400/20'}`} />
      <div className={`absolute top-1/2 left-10 w-16 h-16 rounded-full blur-xl animate-pulse delay-500 ${isDark ? 'bg-pink-500/20' : 'bg-pink-400/20'}`} />
    </div>
  )
}
