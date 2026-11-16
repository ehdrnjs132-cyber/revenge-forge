// Wraps src/game.html (the page body) into a standalone public/index.html.
const fs = require('fs');
const head = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n';
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/index.html', head + fs.readFileSync('src/game.html', 'utf8') + '\n</body></html>\n');
console.log('built public/index.html');
