/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    debugScreens: {
      position: ['top', 'left']
    },
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1100px',
    },
    extend: {
      keyframes:{
        pikiAnimate:{
          "70%": { top: '80px', opacity: "0%" },
          "80%": { top: '80px', opacity: "100%" },
          "100%": {top:'24.50%', opacity: "100%"  },
        },
        cloudAnimate:{
          "0%": { left: "0%" },
          "100%": { left: "47%" },
        }
      },
      animation:{
        piki: 'pikiAnimate 5s normal forwards ease-in-out;',
        cloudAn: 'cloudAnimate 3s normal forwards ease-in-out;'
      },
      fontFamily: {
        "pt": ['PT Sans, sans-serif'],
        "black": ['Palanquin Dark, sans-serif'],
      },
     
      colors:{
      '202124':'#23233b',
      'eeedfd': '#eeedfd',
      '58b4d1':'#2995b3',
      '126782':'#2995b3',
      'e5e5e5': '#e5e5e5',
      '003049': '#75d6f5',
      '343a40':'#343a40',
      'f5f3f4':'#f5f3f4'
      }
    },
  },
  plugins: [
  ],
}
