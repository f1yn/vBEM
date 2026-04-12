import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../');
const docsDir = path.join(rootDirectory, './docs');
const outputPath = path.join(rootDirectory, './docs-site/public/llms.txt');

// Let's read the output dir
const allMarkdownFiles = (await readdir(docsDir, { recursive: true }))
    .filter((file) => file.endsWith('.md'))
    .map(file => path.join('./docs/', file))
    .sort();

// IMPORTANT: Prepend the root readme
allMarkdownFiles.unshift('readme.md');

async function loadAndWriteOutputFile() {
    const allLoadedFiles = await Promise.all(allMarkdownFiles.map(async (name) => ({
        name,
        content: (await readFile(path.resolve(rootDirectory, name), 'utf-8')),
    })));

    // Final output (file XML is somewhat esoteric, but seems to be readily recommended)
    const output = allLoadedFiles.map(({ name, content }) => {
        return [
            // IMPORTANT: Some extra spice here. The boundary seems to be what's important
            `<file name="${name}" rel="vBEM">`,
            content,
            '</file>'
        ].join('\n')
    });

    // Write output
    await writeFile(outputPath, output, 'utf-8');

    console.log(`Concatenated ${allLoadedFiles.length} files to ${outputPath}`);
}

await loadAndWriteOutputFile();

if (process.argv.includes('--watch')) {
    const chokidar = await import('chokidar');

    const watcher = chokidar.watch([docsDir, path.join(rootDirectory, './readme.md')]);

    watcher.on('change', async () => {
        console.log("Change detected, re-running...");
        await loadAndWriteOutputFile();
    });
}