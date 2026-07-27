/**
 * tokens.js — Design System Token Mirror
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for JS-accessible design tokens.
 * These values MUST stay in sync with the @theme / :root blocks in
 * index.css. Any change to index.css palette/shadow/radius tokens
 * should be mirrored here.
 *
 * Purpose: Chart.js and Recharts cannot read CSS custom properties at
 * paint-time, so JS consumers import from this file directly.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Brand & Semantic Colors ────────────────────────────────────────
export const colors = {
  // Brand (Spec exact)
  ink:        '#0B0B0C',
  paper:      '#F7F7F4',
  white:      '#FFFFFF',
  steel:      '#8A8D91',
  steelLight: '#C7C7C2',
  line:       '#E2E1DC',
  signal:     '#FF4423',
  signalDim:  '#FFE4DC',

  // Semantic mappings (retained for component backwards compatibility)
  bg:          '#F7F7F4',
  surface:     '#FFFFFF',
  surface2:    '#F7F7F4',
  border:      '#E2E1DC',
  borderFocus: '#0B0B0C',
  text:        '#0B0B0C',
  textMuted:   '#8A8D91',
  textSubtle:  '#C7C7C2',
  
  primary:       '#0B0B0C',
  primaryHover:  '#27272a',
  primaryLight:  '#E2E1DC',
  
  accent:        '#FF4423',
  accentHover:   '#e63d1f',
  accentLight:   '#FFE4DC',
  
  success:       '#0B0B0C',
  successLight:  '#E2E1DC',
  danger:        '#FF4423',
  dangerLight:   '#FFE4DC',
  warning:       '#FF4423',
  warningLight:  '#FFE4DC',
};

// ── Chart Palette ──────────────────────────────────────────────────
// Pre-composed, ordered list for multi-series charts.
export const chartPalette = [
  colors.ink,
  colors.signal,
  colors.steel,
  colors.steelLight,
  '#4A4C50', // dark gray
  '#D0D0CC', // mid gray
];

// ── Shadows (Monochrome) ───────────────────────────────────────────
export const shadows = {
  xs:  '0 1px 2px 0 rgba(11, 11, 12, 0.05)',
  sm:  '0 2px 8px 0 rgba(11, 11, 12, 0.06)',
  md:  '0 8px 24px -2px rgba(11, 11, 12, 0.08), 0 2px 6px -1px rgba(11, 11, 12, 0.04)',
  lg:  '0 16px 32px -4px rgba(11, 11, 12, 0.12), 0 4px 12px -2px rgba(11, 11, 12, 0.04)',
  xl:  '0 24px 48px -6px rgba(11, 11, 12, 0.16), 0 8px 20px -4px rgba(11, 11, 12, 0.06)',
  '2xl': '0 32px 64px -12px rgba(11, 11, 12, 0.24)',
};

// ── Border Radii ───────────────────────────────────────────────────
export const radius = {
  sm:  '0.5rem',   //  8px
  md:  '0.75rem',  // 12px
  lg:  '1.0rem',   // 16px
  xl:  '1.5rem',   // 24px
  '2xl': '2.0rem', // 32px
  full: '9999px',
};

// ── Spacing Scale ──────────────────────────────────────────────────
export const spacing = {
  0:    '0',
  px:   '1px',
  0.5:  '0.125rem',
  1:    '0.25rem',
  1.5:  '0.375rem',
  2:    '0.5rem',
  2.5:  '0.625rem',
  3:    '0.75rem',
  3.5:  '0.875rem',
  4:    '1rem',
  5:    '1.25rem',
  6:    '1.5rem',
  7:    '1.75rem',
  8:    '2rem',
  10:   '2.5rem',
  12:   '3rem',
  14:   '3.5rem',
  16:   '4rem',
  20:   '5rem',
  24:   '6rem',
  32:   '8rem',
};

// ── Typography Scale ───────────────────────────────────────────────
export const fontFamilies = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  display: "'Bebas Neue', 'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const fontSizes = {
  xs:   '0.75rem',
  sm:   '0.8125rem',
  base: '0.9375rem',
  md:   '1rem',
  lg:   '1.125rem',
  xl:   '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

export const fontWeights = {
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
  extrabold: 800,
};

export const lineHeights = {
  none:    1,
  tight:   1.25,
  snug:    1.375,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2,
};

// ── Motion ────────────────────────────────────────────────────────
export const motion = {
  duration: {
    instant: '100ms',
    fast:    '150ms',
    base:    '200ms',
    slow:    '300ms',
    slower:  '500ms',
    slowest: '700ms',
  },
  easing: {
    linear:   'linear',
    ease:     'ease',
    easeIn:   'ease-in',
    easeOut:  'ease-out',
    easeInOut: 'ease-in-out',
    spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth:   'cubic-bezier(0.4, 0, 0.2, 1)',
    enter:    'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

// ── Z-Index ───────────────────────────────────────────────────────
export const zIndex = {
  below:   -1,
  base:     0,
  raised:  10,
  dropdown: 20,
  sticky:  30,
  overlay: 40,
  modal:   50,
  popover: 60,
  toast:   70,
  tooltip: 80,
};
