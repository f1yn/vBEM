export function extractTitleFromRawMarkdown(bodyString: string) {
    const isMatchTitle = /^(#+)\s/
    const allLines = bodyString.split('\n')
    const matchingLine = allLines.find(line => isMatchTitle.test(line));
    return matchingLine?.replace(isMatchTitle, '') || null;
}