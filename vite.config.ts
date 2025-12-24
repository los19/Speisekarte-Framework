import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({
          include: ['src'],
          exclude: ['src/main.tsx'],
          rollupTypes: false,
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'SpeisekarteFramework',
          fileName: 'index',
          formats: ['es'],
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') {
                return 'styles/index.css';
              }
              return assetInfo.name || 'assets/[name][extname]';
            },
          },
        },
        cssCodeSplit: false,
        sourcemap: true,
        copyPublicDir: false,
      },
      publicDir: false,
    }
  }

  // Default dev/build mode (for testing locally)
  return {
    plugins: [react()],
  }
})
