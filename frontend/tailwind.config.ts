import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        muse: {
          text: 'var(--text)',
          'text-h': 'var(--text-h)',
          bg: 'var(--bg)',
          border: 'var(--border)',
          accent: 'var(--accent)',
          'accent-bg': 'var(--accent-bg)',
          'accent-border': 'var(--accent-border)',
        },
      },
      boxShadow: {
        muse: 'var(--shadow)',
      },
    },
  },
  plugins: [],
} satisfies Config
