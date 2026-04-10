import path from "node:path";
import { defineConfig, fontProviders } from "astro/config";

import sitemap from "@astrojs/sitemap";

const dirname = path.resolve(import.meta.dirname);
const sassPreloadLocation = path.join(dirname, "./src/styles/preload.scss");

export default defineConfig({
	site: "https://vbem.dev",
	integrations: [sitemap()],
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Pathway Gothic One",
			cssVariable: "--font-heading",
		},
	],
	markdown: {
		shikiConfig: {
			wrap: true,
		},
	},
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@use '${sassPreloadLocation}' as *;`,
				},
			},
		},
	},
});
