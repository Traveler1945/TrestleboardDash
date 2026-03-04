const fs = require('fs');
const js = fs.readFileSync('_orig_js.js', 'utf8');

// Find openModal calls
const ids = [];
const re = /openModal\(['"]([^'"]+)['"]\)/g;
let m;
while ((m = re.exec(js)) !== null) {
  if (!ids.includes(m[1])) ids.push(m[1]);
}
console.log('openModal IDs:', ids);

// Find openModal function definition
const fnIdx = js.indexOf('function openModal(');
console.log('\nopenModal:');
console.log(js.slice(fnIdx, fnIdx + 200));

// Find all those modal functions
['openDossier','openContactApprove','openEditLead','openAddLead'].forEach(fn => {
  const idx = js.indexOf(`function ${fn}(`);
  if (idx > -1) {
    // Find the openModal call inside
    const body = js.slice(idx, idx + 600);
    const om = body.match(/openModal\(['"]([^'"]+)['"]\)/);
    console.log(fn, '->', om ? om[1] : 'no openModal call');
  }
});
