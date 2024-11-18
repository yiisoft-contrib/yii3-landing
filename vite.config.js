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
		manifest: true,
		rollupOptions: {
			input: ["app/js/app.js"],
			output: {
				entryFileNames: `js/scripts.js`,
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
