const plugin = require("tailwindcss/plugin")

module.exports = {
	content: ["./app/**/*.html", "./app/**/*.js"],
	darkMode: "class",
	theme: {
		screens: {
			xs: "375px",
			sm: "540px",
			md: "720px",
			lg: "960px",
			xl: "1140px",
			"2xl": "1464px",
		},
		container: {
			center: true,
			padding: "16px",
		},
		fontFamily: {
			sans: ["PT Sans", "sans-serif"],
		},
		extend: {
			colors: {
				orange: {
					DEFAULT: "#F18A2A",
				},
				green: {
					DEFAULT: "#83C933",
				},
				blue: {
					DEFAULT: "#40B3D8",
				},
				lightgray: "#87888C",
				body: "#141518",
				stroke: {
					light: "#EBEBEB",
					dark: "#333437",
				},
			},
			borderRadius: {
				"4xl": "2rem",
				"5xl": "3rem",
			},
			transitionProperty: {
				colors: "color, background-color, border-color, text-decoration-color, box-shadow, fill, stroke",
			},
			transitionDuration: {
				DEFAULT: "300ms",
			},
			zIndex: {
				1: "1",
				2: "2",
				3: "3",
				4: "4",
				5: "5",
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		plugin(function ({ addVariant }) {
			addVariant("current", "&._is-active")
		}),
	],
}
