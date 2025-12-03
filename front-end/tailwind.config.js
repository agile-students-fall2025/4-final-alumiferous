/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2',
          hover: '#1565c0',
          dark: '#2f76bc',
        },
        danger: {
          DEFAULT: '#e63946',
          hover: '#d62839',
          light: '#d32f2f',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        fantasy: ['fantasy'],
      },
      spacing: {
        'header': '64px',
        'footer': '60px',
      },
      borderRadius: {
        'app': '10px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUpFade: {
          '0%': { transform: 'translate(-50%, 20px)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease forwards',
        'slide-up': 'slideUp 0.25s ease forwards',
        'slide-up-fade': 'slideUpFade 0.3s ease forwards',
        'fade-out': 'fadeOut 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}
