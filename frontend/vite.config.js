import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@e965/xlsx', 'number-to-words'],
  },
  build: {
    // Configuración de chunks para reducir el tamaño de bundles
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks para librerías principales
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // PDF y Excel processing
          'document-processing': [
            'jspdf', 
            'jspdf-autotable', 
            '@e965/xlsx', 
            'xlsx', 
            'html2canvas'
          ],
          
          // UI y iconos
          'ui-vendor': [
            'lucide-react',
            'clsx',
            'swiper'
          ],
          
          // Procesamiento de texto y números
          'text-processing': [
            'number-to-words',
            'numero-a-letras',
            'mammoth',
            'tesseract.js'
          ],
          
          // Charts y visualizaciones
          'charts': ['recharts'],
          
          // PDF processing
          'pdf-processing': ['pdfjs-dist', 'canvas'],
          
          // Utilidades de fecha y HTTP
          'utils': ['date-fns', 'axios', '@tanstack/react-query'],
          
          // Animaciones y efectos
          'animations': ['react-simple-typewriter']
        },
        // Configuración adicional para chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)) {
            return `media/[name]-[hash].${extType}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        }
      }
    },
    // Configuración de tamaño de chunks
    chunkSizeWarningLimit: 1000, // Aumenta el límite a 1MB
    
    // Minificación mejorada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.logs en producción
        drop_debugger: true
      }
    },
    
    // Source maps para debugging (opcional)
    sourcemap: false
  }
})
