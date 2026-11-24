/**
 * Plain-text formatting for CMS fields: blank lines separate paragraphs, lines starting with
 * "- " form a bullet list (optionally preceded by a heading line in the same block).
 */
export type Block = { kind: 'p'; text: string } | { kind: 'list'; heading: string | null; items: string[] };

export function toBlocks(text: string): Block[] {
	return text
		.replace(/\r\n/g, '\n')
		.split(/\n{2,}/)
		.map((b) => b.trim())
		.filter(Boolean)
		.map((block): Block => {
			const lines = block.split('\n').map((l) => l.trim());
			const isItem = (l: string) => /^[-•*]\s+/.test(l);
			const rest = isItem(lines[0]) ? lines : lines.slice(1);
			if (rest.length > 0 && rest.every(isItem)) {
				return {
					kind: 'list',
					heading: isItem(lines[0]) ? null : lines[0],
					items: rest.map((l) => l.replace(/^[-•*]\s+/, ''))
				};
			}
			return { kind: 'p', text: block };
		});
}
