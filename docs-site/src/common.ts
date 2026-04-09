export function extractTitleFromRawMarkdown(bodyString: string) {
    const isMatchTitle = /^(#+)\s/
    const allLines = bodyString.split('\n')
    const matchingLine = allLines.find(line => isMatchTitle.test(line));
    return matchingLine?.replace(isMatchTitle, '') || null;
}


const docsLinks = /href="\.\/docs/g;
const assetLinks = /src="\.\/docs-site\/public\//g;

export function transformMarkdownLinks(data: { html: string }) {
    data.html = data.html
        .replace(docsLinks, 'href="/docs')
        .replace(assetLinks, 'src="/')
}