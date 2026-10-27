import { encode } from 'uqr';

/**
 * A QR code as one compact SVG path, drawn on the server from the stored address (docs/BLUEPRINT.md §12.1): no
 * image host sees a wallet address, and the code is always the address the buyer is shown in text beside it.
 * Each dark run of a row is one rectangle, which keeps a 25×25 code under 3 KB.
 */
export function qrSvg(text: string, opts: { title?: string; border?: number } = {}): string {
  const { data, size } = encode(text, { ecc: 'M', border: 0 });
  const border = opts.border ?? 2;
  const full = size + border * 2;
  let d = '';
  for (let y = 0; y < size; y += 1) {
    let x = 0;
    while (x < size) {
      if (!data[y][x]) { x += 1; continue; }
      const start = x;
      while (x < size && data[y][x]) x += 1;
      d += `M${start + border} ${y + border}h${x - start}v1h-${x - start}z`;
    }
  }
  const title = opts.title ? `<title>${opts.title.replace(/[<>&"]/g, '')}</title>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges" role="img">${title}<rect width="${full}" height="${full}" fill="#fff"/><path fill="#000" d="${d}"/></svg>`;
}

/** The module matrix itself, for the unit test that decodes it. */
export function qrMatrix(text: string): boolean[][] {
  return encode(text, { ecc: 'M', border: 0 }).data;
}
