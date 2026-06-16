// ─── KKC Ignite Constants ───────────────────────────────────────────────────

/** Total clicks needed to reach 100% and trigger the climax */
export const TARGET_CLICKS = 5000;

/** How often (ms) the client batches and sends click counts */
export const BATCH_INTERVAL_MS = 500;

/** Supabase Realtime Broadcast channel name */
export const CHANNEL_NAME = 'kkc-ignition';

/** Broadcast event name for click payloads */
export const CLICK_EVENT = 'clicks';

/** Path to the climax video in the public directory */
export const CLIMAX_VIDEO_PATH = '/video/climax.mp4';

// ─── Theme Colors ───────────────────────────────────────────────────────────

export const COLORS = {
  neonPurple: '#b026ff',
  neonCyan: '#00f3ff',
  pitchBlack: '#000000',
  white: '#ffffff',
} as const;
