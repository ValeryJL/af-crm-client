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
                af: {
                    dark: '#1e2022',
                    charcoal: '#2d2f31',
                    gray: '#3a3b3b',
                    lightgray: '#4b4d4f',
                    border: '#374151',
                    surface: '#ffffff',
                    accent: '#2563eb', // Royal Blue industrial
                    cyan: '#0284c7',   // NuSA celeste soberano accent
                    alertRed: '#e11d48',
                    alertAmber: '#d97706',
                    alertOrange: '#ea580c',
                }
            },
            fontFamily: {
                heading: ['Outfit', 'Inter', 'sans-serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
