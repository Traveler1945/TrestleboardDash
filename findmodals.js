const fs = require('fs');
const js = fs.readFileSync('_orig_js.js', 'utf8');

// Find how modals are opened/referenced
const modalIds = [];
const re = /getElementById\(['"]([^'"]*modal[^'"]*)['"]\)/gi;
let m;
while ((m = re.exec(js)) !== null) {
  if (!modalIds.includes(m[1])) modalIds.push(m[1]);
}
console.log('Modal IDs in JS:', modalIds);

// Find openModal calls
const openRe = /openModal\(['"]([^'"]+)['"]\)/g;
while ((m = openRe.exec(js)) !== null) {
  if (!modalIds.includes(m[1])) modalIds.push(m[1]);
}
// Find modal-overlay.open patterns
const openRe2 = /getElementById\(['"]([^'"]+)['"]\)[^;]*\.classList\.add\(['"]open['"]\)/g;
while ((m = openRe2.exec(js)) !== null) {
  console.log('opens:', m[0].slice(0,80));
}

// Find innerHTML assignments that build modal content
const innerRe = /getElementById\(['"]([^'"]+)['"]\)\.innerHTML\s*=/g;
while ((m = innerRe.exec(js)) !== null) {
  console.log('innerHTML set on:', m[1]);
}

// Find .open class adds on modal-like elements
const classRe = /class="modal-overlay"[^>]*id="([^"]+)"/g;
while ((m = classRe.exec(js)) !== null) {
  console.log('modal in JS HTML:', m[1]);
}

// Look for the actual modal HTML in JS strings
const modalInner = js.match(/innerHTML\s*=\s*`[^`]*modal[^`]*`/g);
if (modalInner) console.log('modal innerHTML assignments:', modalInner.length);

// Find how auth gate is shown/hidden
const authRefs = js.match(/auth[^;'"]{0,50}/gi) || [];
authRefs.filter((x,i,a) => a.indexOf(x) === i).slice(0,20).forEach(r => console.log('auth ref:', r));
