import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const enableHttps = env.VITE_ENABLE_HTTPS === 'true';

    return {
        plugins: [
            react(),
            enableHttps ? basicSsl() : null
        ],
        server: {
            host: true,
            https: enableHttps,
            allowedHosts: ['192.168.1.11.nip.io', '172.18.7.253.nip.io', 'localhost', '127.0.0.1', '.ngrok-free.app']
        }
    }
})
