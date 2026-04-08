import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const rootDocs = defineCollection({
    loader: glob({ pattern: "*.md", base: "../" }),
});

const docs = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "../docs" }),
});

export const collections = { docs, rootDocs };