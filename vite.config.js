import { resolve } from "path"
import handlebars from "vite-plugin-handlebars"

export default {
	root: "app",
	plugins: [
		handlebars({
			partialDirectory: resolve(__dirname, "app/partials"),
		}),
	],
	build: {
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, "app/index.html"),
				ru: resolve(__dirname, "app/ru.html"),
			},
			output: {
				entryFileNames: `js/[name].js`,
				chunkFileNames: `js/[name].js`,
				assetFileNames: (file) => {
					let ext = file.name.split(".").pop()

					if (ext === "css") {
						return "css/styles.css"
					}

					return "assets/[name].[ext]"
				},
			},
		},
		outDir: "../public",
	},
}
