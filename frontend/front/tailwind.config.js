/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          900: '#0f1729',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-custom': 'pulse 3s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
        'medical-pulse': 'medical-pulse 4s ease-in-out infinite',
        'dna': 'dna-rotate 20s linear infinite',
        'gradient-shift': 'gradient-shift 6s ease-in-out infinite',
        'particle-move': 'particleMove 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg) scale(1)', 
            opacity: '0.7' 
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(180deg) scale(1.1)', 
            opacity: '1' 
          }
        },
        pulse: {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.4' 
          },
          '50%': { 
            transform: 'scale(1.2)', 
            opacity: '0.8' 
          }
        },
        wave: {
          '0%': { transform: 'translateX(-100%) scaleY(1)' },
          '50%': { transform: 'translateX(0%) scaleY(1.1)' },
          '100%': { transform: 'translateX(100%) scaleY(1)' }
        },
        'medical-pulse': {
          '0%, 100%': { 
            transform: 'scale(1) rotate(0deg)', 
            filter: 'hue-rotate(0deg)' 
          },
          '50%': { 
            transform: 'scale(1.3) rotate(180deg)', 
            filter: 'hue-rotate(90deg)' 
          }
        },
        'dna-rotate': {
          '0%': { transform: 'rotate(0deg) translateY(-50%)' },
          '100%': { transform: 'rotate(360deg) translateY(-50%)' }
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        particleMove: {
          '0%': { 
            transform: 'translateY(100vh) translateX(0) rotate(0deg)', 
            opacity: '0' 
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '0.8' },
          '100%': { 
            transform: 'translateY(-100px) translateX(50px) rotate(360deg)', 
            opacity: '0' 
          }
        }
      }
    },
  },
  plugins: [],
}
