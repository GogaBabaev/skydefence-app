/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#f4f6f0',
          100: '#e3e8d8',
          200: '#c7d2b2',
          300: '#a5b585',
          400: '#7f9455',
          500: '#47612e',   // primary — логотип skydefence
          600: '#3a5026',
          700: '#2e3f1e',
          800: '#1e2914',
          900: '#111a0b',
        },
        dark: {
          DEFAULT: '#0f1509',
          card:    '#161d0d',
          border:  '#2a3a1a',
        },
        gold: '#c8a84b',
        danger: '#e53935',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'military-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2347612e' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
