// tailwind.config.js
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                brand1: '#7d3aff',
                brand2: '#00b4ff'
            }
        }
    },
    plugins: [
        require('daisyui')
    ],
    daisyui: {
        themes: ["dark"]
    }
}
