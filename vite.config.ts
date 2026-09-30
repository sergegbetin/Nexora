import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      // Chemin résolu côté Node (le dossier de travail contient des espaces).
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Le bundle SSR ne sert qu'au pré-rendu : on lui évite la copie des 6 Mo
  // de `public/` (polices, images) qui ont déjà lieu côté build client.
  publicDir: isSsrBuild ? false : 'public',
}))
