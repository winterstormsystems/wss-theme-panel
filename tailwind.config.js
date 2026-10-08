// WSS: Winter Storm Systems palette (see wss/docs/V1_THEME.md). The scale keys and roles are
// core's; only the values change. Neutrals are derived from #2c3e50 (hue ~210deg); the coloured
// scales are built around the canonical WSS colours (500 = canonical value).
const gray = {
    50: '#f1f5f8',
    100: '#e6edf3', // primary text
    200: '#cbd5df', // body text
    300: '#aab7c4', // secondary text
    400: '#8b9aab', // muted text: 5.5:1 on cards
    500: '#6c7d8f', // field borders, grey button fill, meta text
    600: '#1f2c39', // raised surfaces, fields
    700: '#18232e', // cards, sub-navigation
    800: '#121b24', // page background
    900: '#0d141b', // top bar, auth background
};

// Brand blue (#3498db), also used for core's "cyan" accents (active tab, charts, focus).
const brand = {
    50: '#ebf5fb',
    100: '#d6eaf8',
    200: '#aed6f1',
    300: '#85c1e9',
    400: '#5dade2',
    500: '#3498db',
    600: '#2980b9',
    700: '#22699a',
    800: '#1b4f72',
    900: '#143d58',
};

const success = {
    50: '#eafaf1',
    100: '#d5f5e3',
    200: '#abebc6',
    300: '#82e0aa',
    400: '#58d68d',
    500: '#2ecc71',
    600: '#28b463',
    700: '#239b56',
    800: '#1d8348',
    900: '#186a3b',
};

const danger = {
    50: '#fdedec',
    100: '#fadbd8',
    200: '#f5b7b1',
    300: '#f1948a',
    400: '#ec7063',
    500: '#e74c3c',
    600: '#cb4335',
    700: '#b03a2e',
    800: '#943126',
    900: '#78281f',
};

const warning = {
    50: '#fef5e7',
    100: '#fdebd0',
    200: '#fad7a0',
    300: '#f8c471',
    400: '#f5b041',
    500: '#f39c12',
    600: '#d68910',
    700: '#b9770e',
    800: '#9c640c',
    900: '#7e5109',
};

const fontStack = ['"Inter Variable"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'];

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: fontStack,
                header: fontStack,
            },
            colors: {
                black: '#0a1016', // console and editor wells
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: brand,
                blue: brand,
                gray: gray,
                neutral: gray,
                cyan: brand,
                green: success,
                red: danger,
                yellow: warning,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
