import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        allowedHosts: ['192.168.1.11.nip.io', '172.18.7.253.nip.io', 'localhost', '127.0.0.1', '.ngrok-free.app']
    }
})
