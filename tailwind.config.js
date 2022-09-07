module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    
    extend: {
      screens: {
        'md2' : '900px'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'Lexend': ['Lexend', 'sans-serif'],
      },

      keyframes: {
        load: {
          '0%': {
            width: '0%',
          },
          '100%': {
            width: '100%',
          }
        },
        animateIn: {
          '0%': {
            opacity: 0,
            transform: 'translateX(25%)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(0%)',
          }
        },
        dEnter: {
          '0%': {
            transform: 'scale(0.95)',
            opacity: 0,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1,
          }
        },
        dExit: {
          '0%': {
            transform: 'scale(1)',
            opacity: 1,
          },
          '100%': {
            transform: 'scale(0.95)',
            opacity: 0,
          }
        }
      },

      animation: {
        load: 'load 3s ease-in-out',
        animateIn: 'animateIn 0.5s ease-in-out',
        dEnter: 'dEnter 0.1s ease-out',
        dExit: 'dExit 0.1s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ]
}
