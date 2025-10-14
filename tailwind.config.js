import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enables dark mode support
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d6e4ff",
          200: "#adc8ff",
          300: "#84a9ff",
          400: "#6690ff",
          500: "#3366ff",
          600: "#254edb",
          700: "#1939b7",
          800: "#102693",
          900: "#091a7a",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        // Legacy blue for compatibility
        // blue: {
        //   50:  "#f5f4ff",
        //   100: "#eceaff",
        //   200: "#d6d2ff",
        //   300: "#bdb3ff",
        //   400: "#a495ff",
        //   500: "#9381ff", // base color
        //   600: "#7a6ad6",
        //   700: "#6356b3",
        //   800: "#4c418f",
        //   900: "#372d6b",
        // },
      },
      // fontFamily: {
      //   sans: ['Urbanist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      //   heading: ['Urbanist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      // },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.25rem' }],
        sm: ['0.875rem', { lineHeight: '1.5rem' }],
        base: ['1rem', { lineHeight: '1.75rem' }],
        lg: ['1.125rem', { lineHeight: '2rem' }],
        xl: ['1.25rem', { lineHeight: '2.25rem' }],
        '2xl': ['1.5rem', { lineHeight: '2.5rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.75rem' }],
        '4xl': ['2.25rem', { lineHeight: '3rem' }],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(0,0,0,0.04)",
        focus: "0 0 0 2px #3366ff",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
};
