import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Resolves Figma Make virtual asset imports (figma:asset/HASH.ext) to local files in src/assets/
const figmaAssetPlugin = {
  name: 'figma-asset-resolver',
  resolveId(id: string) {
    if (id.startsWith('figma:asset/')) {
      const filename = id.replace('figma:asset/', '')
      return path.resolve(__dirname, `./src/assets/${filename}`)
    }
    return null
  },
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    figmaAssetPlugin,
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 구형 브라우저 호환: 기본값('modules')은 모던 브라우저 전용이라
  // 오래된 iOS Safari / 안드로이드 웹뷰 / 인앱브라우저(네이버·카카오 등)에서
  // 최신 JS 문법 파싱에 실패해 화면이 통째로 백지가 될 수 있다.
  // 넓은 타겟으로 트랜스파일해 구형 환경까지 커버한다.
  build: {
    target: ['es2019', 'safari12', 'chrome70', 'firefox68'],
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  
  // Make HTML files in root accessible
  publicDir: 'public',
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['..']
    }
  }
})