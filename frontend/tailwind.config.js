/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  '#fff8e7',
          100: '#ffefc0',
          200: '#ffe094',
          300: '#ffc94a',
          400: '#ffb01a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        temple: {
          light: '#fffbf0',
          card:  '#fffdf5',
          dark:  '#0f0a1e',
          card_dark: '#1a1232',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        divine: ['Cinzel', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'temple-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
        'temple-gradient-dark': 'linear-gradient(135deg, #b45309 0%, #991b1b 50%, #9d174d 100%)',
      },
      boxShadow: {
        'saffron': '0 4px 24px -4px rgba(245, 158, 11, 0.35)',
        'saffron-lg': '0 8px 40px -8px rgba(245, 158, 11, 0.45)',
        'card': '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        'card-dark': '0 2px 16px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
      },
      animation: {
        'gradient-x': 'gradientX 4s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.4s ease',
        'slideUp': 'slideUp 0.4s ease',
      },
      keyframes: {
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
