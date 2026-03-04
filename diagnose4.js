const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const js = h.slice(h.lastIndexOf('<script>') + 8, h.lastIndexOf('</script>'));

// Show the SECOND DOMContentLoaded (the one from mainJS) - pos 21091
const idx = js.indexOf('DOMContentLoaded', 20000);
console.log('=== Second DOMContentLoaded (1500 chars) ===');
console.log(js.slice(idx - 30, idx + 1500));

// Show what element IDs the original JS references in init
const ids = [];
const re = /getElementById\('([^']+)'\)/g;
let m;
while((m = re.exec(js)) !== null) {
  if(!ids.includes(m[1])) ids.push(m[1]);
}
console.log('\n=== All element IDs referenced by JS ===');
console.log(ids.join(', '));

// Check which of those IDs exist in the HTML body
const missing = ids.filter(id => !h.includes('id="'+id+'"'));
console.log('\n=== IDs referenced by JS but MISSING in HTML ===');
console.log(missing.join(', '));

// Check mode-btn vs mbtn
console.log('\n=== mode-btn references in JS:', (js.match(/mode-btn/g)||[]).length);
console.log('=== mbtn references in JS:', (js.match(/\.mbtn/g)||[]).length);
