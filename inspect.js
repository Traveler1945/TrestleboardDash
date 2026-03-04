const fs = require('fs');
const h = fs.readFileSync('_source_utf8.html', 'utf8');

// Find body
const bodyIdx = h.indexOf('<body');
console.log('body at:', bodyIdx);
if (bodyIdx > -1) {
  console.log('--- BODY START (2000 chars) ---');
  console.log(h.slice(bodyIdx, bodyIdx + 2000));
}
