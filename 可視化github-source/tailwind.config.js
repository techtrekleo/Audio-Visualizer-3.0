/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        lobster: ['Lobster', 'cursive'],
        bungee: ['Bungee', 'cursive'],
        'press-start-2p': ['"Press Start 2P"', 'cursive'],
        pacifico: ['Pacifico', 'cursive'],
        'dancing-script': ['"Dancing Script"', 'cursive'],
        'rocknroll-one': ['"RocknRoll One"', 'sans-serif'],
        'reggae-one': ['"Reggae One"', 'cursive'],
        vt323: ['VT323', 'monospace'],
      }
    },
  },
  plugins: [],
}
