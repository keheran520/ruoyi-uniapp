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
        plugins: [
            uni()
        ],
        exclude:[
            /\/README\.md$/,
        ]
    }
})
