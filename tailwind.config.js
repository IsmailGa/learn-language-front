/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate"

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx,vue}',
    './components/**/*.{ts,tsx,vue}',
    './app/**/*.{ts,tsx,vue}',
    './src/**/*.{ts,tsx,vue}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    /* ── Custom screens (Design System Breakpoints) ──────────── */
    screens: {
      xs:    '480px',    // Mobile L
      sm:    '640px',
      md:    '768px',    // Tablet
      lg:    '1024px',   // Laptop → Full sidebar
      xl:    '1280px',   // Desktop
      '2xl': '1440px',
    },
    extend: {
      /* ── Colors ─────────────────────────────────────────────── */
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        /* Tilgo brand shorthands */
        tilgo: {
          purple:  "#6C63FF",
          pink:    "#FF6584",
          teal:    "#43D9AD",
          yellow:  "#FFD166",
          dark:    "#1A1A2E",
        },
      },

      /* ── Spacing ─────────────────────────────────────────────── */
      spacing: {
        /* Sidebar widths */
        'sidebar':         '240px',
        'sidebar-compact': '72px',
        'bottom-nav':      '60px',
      },

      /* ── Border Radius ──────────────────────────────────────── */
      borderRadius: {
        '4xl': '2rem',
        xl:    "calc(var(--radius) + 4px)",
        lg:    "var(--radius)",
        md:    "calc(var(--radius) - 2px)",
        sm:    "calc(var(--radius) - 4px)",
      },

      /* ── Font Family ─────────────────────────────────────────── */
      fontFamily: {
        sans:   ['Nunito', 'Noto Sans KR', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },

      /* ── Font Size (Fluid) ───────────────────────────────────── */
      fontSize: {
        'display': ['clamp(1.75rem, 4vw, 3rem)',      { lineHeight: '1.1',  fontWeight: '900' }],
        'h1':      ['clamp(1.75rem, 4vw, 3rem)',      { lineHeight: '1.15', fontWeight: '900' }],
        'h2':      ['clamp(1.375rem, 3vw, 2.25rem)', { lineHeight: '1.2',  fontWeight: '800' }],
        'h3':      ['clamp(1.125rem, 2.2vw, 1.625rem)', { lineHeight: '1.3', fontWeight: '700' }],
        'h4':      ['clamp(1rem, 1.6vw, 1.25rem)',   { lineHeight: '1.4',  fontWeight: '700' }],
        'body':    ['clamp(0.875rem, 1.2vw, 1rem)',  { lineHeight: '1.65' }],
        'sm':      ['0.875rem',                       { lineHeight: '1.5' }],
        'caption': ['clamp(0.6875rem, 1vw, 0.8125rem)', { lineHeight: '1.4' }],
        'label':   ['clamp(0.8125rem, 1.1vw, 0.9375rem)', { lineHeight: '1.2', fontWeight: '700' }],
      },

      /* ── Box Shadow ─────────────────────────────────────────── */
      boxShadow: {
        'sm':      '0 1px 4px rgba(108, 99, 255, 0.06)',
        'DEFAULT': '0 4px 16px rgba(108, 99, 255, 0.10)',
        'md':      '0 4px 16px rgba(108, 99, 255, 0.10)',
        'lg':      '0 8px 32px rgba(108, 99, 255, 0.14)',
        'xl':      '0 16px 48px rgba(108, 99, 255, 0.18)',
        'primary': '0 8px 24px hsl(243.5 100% 69.4% / 0.28)',
        'accent':  '0 8px 24px hsl(347.9 100% 69.8% / 0.28)',
        'success': '0 8px 24px hsl(162.4 66.4% 55.7% / 0.28)',
        'card':    '0 2px 8px rgba(108, 99, 255, 0.08)',
      },

      /* ── Animation ──────────────────────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: 0 },
        },
        "pop-in": {
          from: { transform: "scale(0.6)", opacity: 0 },
          to:   { transform: "scale(1)",   opacity: 1 },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: 0 },
          to:   { transform: "translateY(0)",    opacity: 1 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        "pulse-dot": {
          "0%, 80%, 100%": { transform: "scale(1)",   opacity: 0.4 },
          "40%":           { transform: "scale(1.3)", opacity: 1 },
        },
        "shimmer": {
          from: { backgroundPosition: "-200% 0" },
          to:   { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "pop-in":         "pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-up":       "slide-up 0.4s ease both",
        "fade-in":        "fade-in 0.3s ease both",
        "pulse-dot":      "pulse-dot 0.9s ease-in-out infinite",
        "shimmer":        "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [animate],
}