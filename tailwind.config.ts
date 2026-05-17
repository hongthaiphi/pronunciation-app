import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        correct: '#10b981',
        partial: '#eab308',
        incorrect: '#ef4444',
      },
    },
  },
  plugins: [],
}
export default config
