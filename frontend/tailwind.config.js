import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes:{
    extend: {
      colors: {
        meadow: {
          bg: "#FFFCF9",       // soft cream background
          card: "#FFFDE7",     // pale yellow (like sunlight on grass)
          primary: "#AED581",  // fresh green (main actions)
          secondary: "#FFB74D",// warm sunflower orange
          accent: "#4FC3F7",   // sky blue (links/buttons)
          flower: "#F48FB1",   // soft pink (highlights / alerts)
          border: "#E0F2F1",   // light teal border
          text: "#3E2723"      // deep earthy brown for text
        }
      }
    }
  }
},
};