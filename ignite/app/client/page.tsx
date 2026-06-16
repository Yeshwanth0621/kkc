'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isConfigured } from '@/app/lib/supabase';
import { CHANNEL_NAME, CLICK_EVENT, BATCH_INTERVAL_MS } from '@/app/lib/constants';

// ─── Particle Burst Helper ──────────────────────────────────────────────────
function spawnParticles(container: HTMLDivElement, count: number = 12) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.transform = 'translate(-50%, -50%)';

    // Vary particle colors between purple and cyan
    if (Math.random() > 0.6) {
      particle.style.background = '#00f3ff';
    }

    container.appendChild(particle);
    setTimeout(() => particle.remove(), 700);
  }
}

// ─── Ripple Ring Helper ─────────────────────────────────────────────────────
function spawnRipple(container: HTMLDivElement) {
  const ring = document.createElement('div');
  ring.className = 'ripple-ring';
  ring.style.left = '50%';
  ring.style.top = '50%';
  ring.style.transform = 'translate(-50%, -50%)';
  container.appendChild(ring);
  setTimeout(() => ring.remove(), 800);
}

// ─── Ambient Floating Particles ─────────────────────────────────────────────
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function AmbientParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => {
    const r1 = pseudoRandom(i * 12.34 + 1.1);
    const r2 = pseudoRandom(i * 56.78 + 2.2);
    const r3 = pseudoRandom(i * 90.12 + 3.3);
    const r4 = pseudoRandom(i * 34.56 + 4.4);
    const r5 = pseudoRandom(i * 78.90 + 5.5);
    const r6 = pseudoRandom(i * 12.34 + 6.6);

    return {
      id: i,
      x: `${r1 * 100}%`,
      delay: `${r2 * 8}s`,
      duration: `${6 + r3 * 8}s`,
      size: r4 > 0.7 ? 3 : 2,
      color: r5 > 0.5 ? '#b026ff' : '#00f3ff',
      opacity: 0.15 + r6 * 0.3,
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="ambient-particle"
          style={{
            '--x': p.x,
            '--delay': p.delay,
            '--duration': p.duration,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CLIENT PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ClientPage() {
  const batchCountRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [showTapFeedback, setShowTapFeedback] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error' | 'unconfigured'
  >(isConfigured ? 'connecting' : 'unconfigured');

  // ── Setup broadcast channel & batch interval ──────────────────────────
  useEffect(() => {
    if (!isConfigured) return;

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: false } },
    });

    channel.subscribe((status) => {
      console.log('[KKC Client] Connection status:', status);
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected');
      } else if (status === 'TIMED_OUT') {
        setConnectionStatus('disconnected');
      } else if (status === 'CHANNEL_ERROR') {
        setConnectionStatus('error');
      }
    });

    channelRef.current = channel;

    // Batch interval: send accumulated clicks every BATCH_INTERVAL_MS
    const intervalId = setInterval(() => {
      const count = batchCountRef.current;
      if (count > 0) {
        channel.send({
          type: 'broadcast',
          event: CLICK_EVENT,
          payload: { count },
        });
        batchCountRef.current = 0;
      }
    }, BATCH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Handle Tap ────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    // Increment batch counter
    batchCountRef.current += 1;
    setTapCount((prev) => prev + 1);

    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Visual effects
    if (buttonContainerRef.current) {
      spawnRipple(buttonContainerRef.current);
      spawnParticles(buttonContainerRef.current, 10);
    }

    // Flash feedback
    setShowTapFeedback(true);
    setTimeout(() => setShowTapFeedback(false), 150);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-black overflow-hidden select-none scanlines">
      <AmbientParticles />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <motion.div
        className="absolute top-8 text-center z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-xs tracking-[0.4em] uppercase text-white/40 font-light">
          Kalam Knowledge Club
        </h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-neon-cyan/50 mt-1">
          Inauguration Ceremony
        </p>
      </motion.div>

      {/* ── Connection Status Indicator ──────────────────────────────── */}
      <div className="absolute top-24 flex items-center gap-2 z-10 text-[9px] tracking-widest uppercase text-white/45">
        <span className={`h-2 w-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' :
          connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]' :
          connectionStatus === 'unconfigured' ? 'bg-zinc-600 shadow-none' :
          'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]'
        }`} />
        <span>
          {connectionStatus === 'connected' && 'SYSTEM READY'}
          {connectionStatus === 'connecting' && 'CONNECTING TO BEACON...'}
          {connectionStatus === 'unconfigured' && 'OFFLINE (SETUP ENV)'}
          {connectionStatus === 'disconnected' && 'CONNECTION TIMED OUT'}
          {connectionStatus === 'error' && 'CONNECTION ERROR'}
        </span>
      </div>

      {/* ── IGNITE Button ────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      >
        <div
          ref={buttonContainerRef}
          className="relative flex items-center justify-center"
          style={{ width: 220, height: 220 }}
        >
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(176,38,255,0.15) 0%, transparent 70%)',
              transform: 'scale(1.8)',
            }}
          />

          {/* Main button */}
          <motion.button
            id="ignite-button"
            className="relative w-[200px] h-[200px] rounded-full border-0 cursor-pointer ignite-glow focus:outline-none"
            style={{
              background: `
                radial-gradient(circle at 40% 40%, rgba(176,38,255,0.8), rgba(120,0,200,0.6) 50%, rgba(60,0,120,0.9) 100%)
              `,
            }}
            onPointerDown={() => setIsPressed(true)}
            onPointerUp={() => setIsPressed(false)}
            onPointerLeave={() => setIsPressed(false)}
            onClick={handleTap}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            aria-label="Ignite - Tap to contribute"
          >
            {/* Inner highlight */}
            <div
              className="absolute inset-3 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15) 0%, transparent 60%)',
              }}
            />

            {/* Button border ring */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: '1px solid rgba(176,38,255,0.5)',
                boxShadow: isPressed
                  ? 'inset 0 0 40px rgba(176,38,255,0.6)'
                  : 'inset 0 0 20px rgba(176,38,255,0.2)',
              }}
            />

            {/* Label */}
            <span
              className="relative z-10 text-2xl font-bold tracking-[0.3em] text-white"
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(176,38,255,0.5)',
              }}
            >
              IGNITE
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── Tap Counter ──────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-16 text-center z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.p
            key={tapCount}
            className="text-3xl font-bold tabular-nums"
            style={{
              background: 'linear-gradient(135deg, #b026ff, #00f3ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {tapCount}
          </motion.p>
        </AnimatePresence>
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mt-2">
          Your Taps
        </p>
      </motion.div>

      {/* ── Tap flash overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {showTapFeedback && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            style={{ background: 'radial-gradient(circle, rgba(176,38,255,0.1) 0%, transparent 60%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* ── Configuration Warning ───────────────────────────────────── */}
      {connectionStatus === 'unconfigured' && (
        <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-400 p-3 rounded-md text-center backdrop-blur-sm z-20">
          ⚠️ <span className="font-semibold text-white">Supabase is not configured!</span> Please update <code className="bg-black/50 px-1 py-0.5 rounded text-white">.env.local</code> with your credentials and restart the dev server.
        </div>
      )}
    </div>
  );
}
