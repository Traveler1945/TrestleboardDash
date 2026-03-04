const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const js = h.slice(h.lastIndexOf('<script>') + 8, h.lastIndexOf('</script>'));

// 1. Check the auth gate HTML
const agStart = h.indexOf('<div id="auth-gate">');
const agEnd = h.indexOf('</div>', agStart) + 6; // shallow - just first closing div
console.log('=== AUTH GATE HTML (first 400 chars) ===');
console.log(h.slice(agStart, agStart + 400));

// 2. Find checkAuth function
const caIdx = js.indexOf('async function checkAuth');
console.log('\n=== checkAuth (first 600 chars) ===');
console.log(js.slice(caIdx, caIdx + 600));

// 3. Find DOMContentLoaded / init
const domIdx = js.indexOf('DOMContentLoaded');
console.log('\n=== DOMContentLoaded block ===');
console.log(js.slice(domIdx, domIdx + 800));

// 4. Look for showSection calls that might break
const ssCount = (js.match(/showSection\(/g)||[]).length;
console.log('\n=== showSection calls:', ssCount, '===');

// 5. Check the mode selector - original JS might look for specific classes
const modeCheck = js.indexOf('setAutonomyMode');
console.log('\n=== setAutonomyMode (first 400 chars) ===');
console.log(js.slice(modeCheck, modeCheck + 400));

// 6. Look for class toggles that use 'active' - could conflict with our 'on'
const activeToggles = (js.match(/classList\.(add|remove|toggle)\('active'\)/g)||[]);
console.log('\n=== active class toggles in JS:', activeToggles.length);
activeToggles.slice(0,10).forEach(x => console.log(' ', x));

// 7. Check for section-command etc - original may try to show/hide these
const sectionIds = ['section-command','section-pipeline','section-forecast','section-discovery','section-analytics'];
sectionIds.forEach(id => {
  const count = (js.match(new RegExp(id,'g'))||[]).length;
  console.log('  ' + id + ':', count, 'references');
});
