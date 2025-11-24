/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#5A4BDA', // PW Purple-ish
                secondary: '#1F1F1F',
                accent: '#FFD700',
            }
        },
    },
    plugins: [],
}
