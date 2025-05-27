import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  content: [
    './Frontend/src/**/*.{js,jsx,ts,tsx}',
    './Frontend/public/index.html',
    './node_modules/@material-tailwind/react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [
    tailwindcss('../tailwind.config.js'),
    autoprefixer,
  ],
};
