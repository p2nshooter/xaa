/**
 * Serialise JSON-LD for embedding in a `<script>` element.
 *
 * `JSON.stringify` produces valid JSON, and valid JSON is not automatically
 * safe inside HTML. The parser does not read a script body as JSON — it scans
 * it for the literal `</script`, and ends the element there, whatever the JSON
 * meant. A headline carrying that string closes the block early and everything
 * after it is parsed as markup:
 *
 *   headline: "… </script><script>…</script>"
 *
 * Article titles here are written and translated by machine, not typed and
 * checked by a person, so that is a value this can actually receive.
 *
 * Escaping every `<` as its \u003c form closes it. Same JSON — `JSON.parse`
 * returns the original string — and neither `</script` nor `<!--` survives.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
