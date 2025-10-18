import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Optimized Vite configuration for production builds
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh only in development
      fastRefresh: process.env.NODE_ENV === 'development',
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
      // Enable React SWC compilation for faster builds
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [
          // Code splitting plugins
          '@babel/plugin-syntax-dynamic-import',
          // Tree shaking optimization
          'babel-plugin-transform-react-remove-prop-types',
          // Minification
          ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }]
        ] : []
      }
    })
  ],

  build: {
    // Enable source maps for debugging (remove in production for smaller bundles)
    sourcemap: process.env.NODE_ENV === 'development',

    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox78', 'safari13'],

    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: process.env.NODE_ENV === 'production',
        // Remove debugger statements
        drop_debugger: true,
        // Remove unused code
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.time', 'console.timeEnd'],
        // Optimize conditionals
        conditionals: true,
        // Optimize comparisons
        comparisons: true,
        // Optimize booleans
        booleans: true,
        // Optimize loops
        loops: true,
        // Optimize dead code
        dead_code: true,
        // Evaluate expressions
        evaluate: true,
        // Inline functions
        inline: 2,
        // Join consecutive strings
        join_vars: true,
        // Negate conditionals
        negate_iife: true,
        // Optimize properties
        properties: true,
        // Optimize sequences
        sequences: true,
        // Optimize switch statements
        switches: true,
        // Remove typeof checks
        typeofs: true,
        // Optimize undefined
        unsafe: true,
        // Remove unused variables
        unused: true
      },
      mangle: {
        // Mangle properties and variable names
        toplevel: true,
        // Preserve some property names for React
        reserved: ['React', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo']
      },
      format: {
        // Remove comments
        comments: false
      }
    },

    // Code splitting configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.tsx'),
        // Add additional entry points if needed
        vendor: resolve(__dirname, 'src/vendor.ts'),
        admin: resolve(__dirname, 'src/admin.ts')
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'clsx'],
          // Charts and visualization
          'charts-vendor': ['recharts', 'chart.js', 'react-chartjs-2'],
          // Date and time utilities
          'date-vendor': ['date-fns', 'dayjs'],
          // Form and validation
          'form-vendor': ['react-hook-form', 'yup', '@hookform/resolvers'],
          // State management
          'state-vendor': ['@reduxjs/toolkit', 'react-redux'],
          // Development tools (only in development)
          ...(process.env.NODE_ENV === 'development' ? {
            'dev-vendor': ['@vitejs/plugin-react', 'vite']
          } : {})
        },
        // Chunk naming pattern
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace(/\.[^.]*$/, '')
            return `js/${fileName}-[hash].js`
          }
          return 'js/[name]-[hash].js'
        },
        // Asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `media/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      },
      // External dependencies (if using CDN)
      external: process.env.NODE_ENV === 'production' ? [
        // 'react',
        // 'react-dom'
      ] : []
    },

    // Chunk size warning limit (increased for large applications)
    chunkSizeWarningLimit: 1000,

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'date-fns',
        'recharts',
        '@headlessui/react'
      ],
      exclude: [
        // Exclude development dependencies
        'vite',
        '@vitejs/plugin-react'
      ]
    },

    // Report compressed size for more realistic bundle analysis
    reportCompressedSize: true,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Generate manifest for PWA
    manifest: true
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@styles': resolve(__dirname, 'src/styles')
    },
    // Optimize module resolution
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },

  // CSS configuration
  css: {
    // Enable CSS modules
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: process.env.NODE_ENV === 'production'
        ? '[hash:base64:6]'
        : '[name]__[local]___[hash:base64:5]'
    },
    // PostCSS configuration
    postcss: {
      plugins: [
        // Autoprefixer for cross-browser compatibility
        'autoprefixer',
        // CSS optimization in production
        ...(process.env.NODE_ENV === 'production' ? [
          'cssnano',
          {
            preset: ['default', {
              // Optimize CSS
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              minifySelectors: true,
              minifyFontValues: true,
              minifyParams: true,
              convertValues: true,
              reduceIdents: true,
              zindex: false // Don't optimize z-index as it can break layouts
            }]
          }
        ] : [])
      ]
    },
    // Enable CSS preprocessing
    preprocessorOptions: {
      scss: {
        // Optimize SCSS compilation
        includePaths: [resolve(__dirname, 'src/styles')],
        // Enable CSS imports
        additionalData: `@import "src/styles/variables.scss";`
      }
    },
    // Enable CSS dev sourcemaps in development
    devSourcemap: process.env.NODE_ENV === 'development'
  },

  // Development server configuration
  server: {
    // Enable HMR
    hmr: true,
    // Optimize for development
    host: true,
    port: 3000,
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production'
  },

  // Environment variables
  envPrefix: 'VITE_',

  // Experimental features
  experimental: {
    // Enable build optimization
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
})