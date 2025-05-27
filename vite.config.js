import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'Frontend', // Ensure Vite serves from the Frontend folder
});
