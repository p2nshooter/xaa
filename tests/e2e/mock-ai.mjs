// Stand-in for https://api.ulyah.com/ai/reader. Logs every request body and
// answers with text that deliberately contains secrets the scrubber must remove.
import http from 'node:http';
import { appendFileSync, writeFileSync } from 'node:fs';
const LOG = new URL('./mock-ai.log', import.meta.url).pathname;
writeFileSync(LOG, '');
http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    appendFileSync(LOG, body + '\n');
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ task: 'ask', result: 'We accept USDT on TRC20. Send to TNo8jgJqmnUGAPUDb159cC8uhAeFDP8keW or 0x1bed722b27b3d2bdab3dfe06ea75b84a3a824f3d, key sk-live-abcdefghijklmnop123456, account 2090571542. The exact address is on your invoice in the client portal.', servedBy: 'mock' }));
  });
}).listen(8899, () => console.log('mock AI on 8899'));
