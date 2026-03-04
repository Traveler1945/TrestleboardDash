const fs = require('fs');
const js = fs.readFileSync('_orig_js.js', 'utf8');

// Find all .classList.add('open') to find modal IDs
const re = /getElementById\(['"]([\w-]+)['"]\)(?:\s*\?\s*[^:]+\s*:\s*null|\s*)\.classList\.add\(['"]open['"]\)/g;
let m;
const opens = [];
while ((m = re.exec(js)) !== null) opens.push(m[1]);
// Also find simpler patterns
const re2 = /([\w]+)\s*=\s*document\.getElementById\(['"]([\w-]+)['"]\)[;\s]*[\s\S]{0,200}?classList\.add\(['"]open['"]\)/g;
while ((m = re2.exec(js)) !== null) opens.push(m[2]);
console.log('Modal open targets:', [...new Set(opens)]);

// Find function openAddLead, openStrategicBrief, openDossier etc
const fnNames = ['openAddLead', 'openStrategicBrief', 'openDossier', 'openContactApprove', 'openMeeting', 'openBrief', 'closeModal', 'showModal'];
fnNames.forEach(fn => {
  const idx = js.indexOf('function ' + fn);
  if (idx > -1) {
    const body = js.slice(idx, idx + 400);
    console.log('\n--- ' + fn + ' ---');
    console.log(body.split('\n').slice(0, 10).join('\n'));
  }
});

// Search for class="modal-overlay" pattern in JS strings (backtick template literals)
const inBt = js.match(/`[^`]*modal-overlay[^`]*`/g);
if (inBt) inBt.forEach(s => console.log('\nmodal in template literal:', s.slice(0, 200)));

// Find overlay.classList.add patterns
const oclRe = /(\w+)\.classList\.add\(['"]open['"]\)/g;
const oclFound = [];
while ((m = oclRe.exec(js)) !== null) {
  const varName = m[1];
  // Try to find the variable assignment  
  const assignRe = new RegExp(`const ${varName}\\s*=\\s*document\\.getElementById\\(['"](\\w[\\w-]*)['"']\\)`, 'g');
  const aMatch = assignRe.exec(js.slice(0, m.index));
  if (aMatch) oclFound.push(aMatch[1]);
}
console.log('\nModal ids from variable pattern:', [...new Set(oclFound)]);
