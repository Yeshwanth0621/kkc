'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
  useMotionValue,
} from 'framer-motion';
import { supabase, isConfigured } from '@/app/lib/supabase';
import {
  CHANNEL_NAME,
  CLICK_EVENT,
  TARGET_CLICKS,
  CLIMAX_VIDEO_PATH,
} from '@/app/lib/constants';

// ─── Spring config for silky-smooth interpolation ───────────────────────────
const SPRING_CONFIG = { stiffness: 60, damping: 30, restDelta: 0.0001 };

// ─── Phases ─────────────────────────────────────────────────────────────────
type Phase = 'filling' | 'flash' | 'black' | 'video';

// ═════════════════════════════════════════════════════════════════════════════
// PROJECTOR PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ProjectorPage() {
  const [totalClicks, setTotalClicks] = useState(0);
  const [phase, setPhase] = useState<Phase>('filling');
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const unsubscribedRef = useRef(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error' | 'unconfigured'
  >(isConfigured ? 'connecting' : 'unconfigured');

  // ── Motion values ─────────────────────────────────────────────────────
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, SPRING_CONFIG);

  // Map progress to display percentage (0..100)
  const displayPercent = useTransform(smoothProgress, [0, 1], [0, 100]);

  // Map progress to glow intensity
  const glowIntensity = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [
      'drop-shadow(0 0 6px rgba(0,243,255,0.2))',
      'drop-shadow(0 0 20px rgba(0,243,255,0.5)) drop-shadow(0 0 40px rgba(0,243,255,0.3))',
      'drop-shadow(0 0 40px rgba(0,243,255,0.8)) drop-shadow(0 0 80px rgba(0,243,255,0.5)) drop-shadow(0 0 120px rgba(255,255,255,0.3))',
    ]
  );

  // ── Trigger climax sequence ───────────────────────────────────────────
  const triggerClimax = useCallback(() => {
    if (unsubscribedRef.current) return;
    unsubscribedRef.current = true;

    // Unsubscribe from channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Force progress to 100%
    rawProgress.set(1);

    // Phase sequence: flash → black → video
    setPhase('flash');
    setTimeout(() => {
      setPhase('black');
      setTimeout(() => {
        setPhase('video');
      }, 800);
    }, 1000);
  }, [rawProgress]);

  useEffect(() => {
    if (!isConfigured) return;

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: CLICK_EVENT }, (payload) => {
        if (unsubscribedRef.current) return;

        const incomingCount = payload.payload?.count ?? 0;

        setTotalClicks((prev) => {
          const newTotal = prev + incomingCount;
          const progress = Math.min(newTotal / TARGET_CLICKS, 1);
          rawProgress.set(progress);

          // Check for climax
          if (newTotal >= TARGET_CLICKS) {
            // Use setTimeout to avoid state update during render
            setTimeout(() => triggerClimax(), 50);
          }

          return newTotal;
        });
      })
      .subscribe((status) => {
        console.log('[KKC Projector] Connection status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'TIMED_OUT') {
          setConnectionStatus('disconnected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rawProgress, triggerClimax]);

  // ── Failsafe: Ctrl + Shift + K ────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        console.log('[KKC Projector] Failsafe triggered!');
        setTotalClicks(TARGET_CLICKS);
        rawProgress.set(1);
        triggerClimax();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rawProgress, triggerClimax]);

  // ── SVG dimensions ────────────────────────────────────────────────────
  const size = 500;
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-black overflow-hidden scanlines">
      {/* Hex grid background */}
      <div className="fixed inset-0 hex-grid opacity-100 pointer-events-none" />

      {/* ── Connection Status Indicator ──────────────────────────────── */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-10 text-[9px] tracking-widest uppercase text-white/40">
        <span className={`h-2 w-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' :
          connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]' :
          connectionStatus === 'unconfigured' ? 'bg-zinc-600 shadow-none' :
          'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]'
        }`} />
        <span>
          {connectionStatus === 'connected' && 'BEACON ONLINE'}
          {connectionStatus === 'connecting' && 'AWAITING BEACON...'}
          {connectionStatus === 'unconfigured' && 'OFFLINE (SETUP ENV)'}
          {connectionStatus === 'disconnected' && 'TIMEOUT'}
          {connectionStatus === 'error' && 'ERROR'}
        </span>
      </div>

      {/* ── FILLING PHASE ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'filling' && (
          <motion.div
            key="filling"
            className="flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ── Title ───────────────────────────────────────────── */}
            <motion.div
              className="absolute top-12 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1
                className="text-sm tracking-[0.6em] uppercase font-light"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Kalam Knowledge Club
              </h1>
              <p
                className="text-xs tracking-[0.3em] uppercase mt-2"
                style={{ color: 'rgba(0,243,255,0.4)' }}
              >
                Collective Ignition Sequence
              </p>
            </motion.div>

            {/* ── Progress Ring ────────────────────────────────────── */}
            <motion.svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="ring-glow"
              style={{ filter: glowIntensity }}
            >
              {/* Outer decorative ring */}
              <circle
                cx={center}
                cy={center}
                r={radius + 20}
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="0.5"
              />

              {/* Track ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={strokeWidth}
              />

              {/* Tick marks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
                const isMajor = i % 5 === 0;
                const innerR = radius - (isMajor ? 15 : 8);
                const outerR = radius - 3;
                return (
                  <line
                    key={i}
                    x1={center + Math.cos(angle) * innerR}
                    y1={center + Math.sin(angle) * innerR}
                    x2={center + Math.cos(angle) * outerR}
                    y2={center + Math.sin(angle) * outerR}
                    stroke={isMajor ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}
                    strokeWidth={isMajor ? 1.5 : 0.5}
                  />
                );
              })}

              {/* Progress arc — smooth spring-animated fill */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth + 2}
                strokeLinecap="round"
                style={{
                  pathLength: smoothProgress,
                  rotate: -90,
                  transformOrigin: `${center}px ${center}px`,
                }}
                stroke="url(#progressGradient)"
              />

              {/* Inner glow ring — secondary fill for depth */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius - 12}
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                style={{
                  pathLength: smoothProgress,
                  rotate: -90,
                  transformOrigin: `${center}px ${center}px`,
                  opacity: 0.4,
                }}
                stroke="url(#innerGlowGradient)"
              />

              {/* Inner decorative circle */}
              <circle
                cx={center}
                cy={center}
                r={radius - 30}
                fill="none"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="0.5"
              />

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00f3ff" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#00f3ff" />
                </linearGradient>
                <linearGradient id="innerGlowGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b026ff" />
                  <stop offset="100%" stopColor="#00f3ff" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* ── Center Percentage ────────────────────────────────── */}
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{ width: size, height: size }}
            >
              <PercentDisplay value={displayPercent} />
              <p
                className="text-[10px] tracking-[0.4em] uppercase mt-3"
                style={{ color: 'rgba(0,243,255,0.4)' }}
              >
                Ignition Power
              </p>
            </div>

            {/* ── Bottom Stats ─────────────────────────────────────── */}
            <motion.div
              className="absolute bottom-12 flex gap-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{
                    background: 'linear-gradient(135deg, #00f3ff, #ffffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {totalClicks.toLocaleString()}
                </p>
                <p className="text-[9px] tracking-[0.3em] uppercase text-white/20 mt-1">
                  Total Taps
                </p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{
                    background: 'linear-gradient(135deg, #b026ff, #00f3ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {TARGET_CLICKS.toLocaleString()}
                </p>
                <p className="text-[9px] tracking-[0.3em] uppercase text-white/20 mt-1">
                  Target
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── FLASH PHASE ──────────────────────────────────────────── */}
        {phase === 'flash' && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-50"
            style={{ background: '#ffffff' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1,
              times: [0, 0.1, 0.6, 1],
              ease: 'easeInOut',
            }}
          />
        )}

        {/* ── BLACK PHASE ──────────────────────────────────────────── */}
        {phase === 'black' && (
          <motion.div
            key="black"
            className="fixed inset-0 z-40 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* ── VIDEO PHASE ──────────────────────────────────────────── */}
        {phase === 'video' && (
          <motion.div
            key="video"
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <video
              src={CLIMAX_VIDEO_PATH}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              controls={false}
              onEnded={() => {
                // Optional: loop or show a final screen
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Configuration Warning ───────────────────────────────────── */}
      {connectionStatus === 'unconfigured' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-400 py-3 px-6 rounded-md text-center backdrop-blur-sm z-50">
          ⚠️ <span className="font-semibold text-white">Projector is Offline:</span> Supabase environment variables are missing or default in <code className="bg-black/50 px-1 py-0.5 rounded text-white">.env.local</code>. Please configure them to sync taps.
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PERCENT DISPLAY — smoothly animated number readout
// ═════════════════════════════════════════════════════════════════════════════
function PercentDisplay({ value }: { value: ReturnType<typeof useTransform<number, number>> }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = value.on('change', (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsubscribe;
  }, [value]);

  return (
    <div className="flex items-baseline gap-1">
      <span
        className="text-7xl font-bold tabular-nums"
        style={{
          background: display >= 90
            ? 'linear-gradient(135deg, #ffffff, #00f3ff)'
            : display >= 50
              ? 'linear-gradient(135deg, #00f3ff, #b026ff)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          filter: display >= 80
            ? `drop-shadow(0 0 20px rgba(0,243,255,0.4))`
            : 'none',
        }}
      >
        {display}
      </span>
      <span
        className="text-2xl font-light"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        %
      </span>
    </div>
  );
}
