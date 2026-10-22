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
                    charcoal: '#282a2d',
                    gray: '#3a3b3b',
                    lightgray: '#525456',
                    border: '#3f4246',
                    surface: '#ffffff',
                    accent: '#d97706', // Ámbar / Oro industrial AF
                    accentHover: '#b45309',
                    red: '#dc2626',
                    green: '#16a34a',
                }
            },
            fontFamily: {
                heading: ['Outfit', 'Inter', 'sans-serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'none': '0px',
                'sm': '2px',
                'DEFAULT': '4px',
                'md': '4px',
                'lg': '6px',
                'xl': '8px',
                '2xl': '8px',
                '3xl': '10px',
                'full': '9999px',
            }
        },
    },
    plugins: [],
}
