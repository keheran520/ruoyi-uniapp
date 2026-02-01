import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig(() => {
    return {
        base: './',
        publicDir: 'public',
        build: {
            minify: true,
            outDir: 'dist',
        },
        server: {
            port: '3002',
            proxy: {
                '/dev-api': {
                    target: 'http://localhost:8080',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/dev-api/, '')
                }
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    // 抑制 Sass 弃用警告
                    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
                    api: 'modern-compiler' // 使用现代编译器
                }
            }
        },
        plugins: [
            uni()
        ],
        exclude:[
            /\/README\.md$/,
        ]
    }
})
