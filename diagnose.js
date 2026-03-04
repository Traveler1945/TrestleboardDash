const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');

// Get the inline script block
const scriptStart = h.lastIndexOf('<script>');
const scriptEnd = h.lastIndexOf('</script>');
const js = h.slice(scriptStart + 8, scriptEnd);

console.log('=== FILE STATS ===');
console.log('Total size:', Math.round(h.length/1024) + 'KB');
console.log('JS block size:', Math.round(js.length/1024) + 'KB');

// Check key functions
const fns = ['showPage','showPipelineView','toggleAcc','updateIntelBanner',
  'mountIntelSections','renderDiscoveryHero','renderCommandCharts',
  'renderKanban','renderLeadTable','renderAll','renderCommand',
  'checkAuth','setAutonomyMode','importDiscoveryLead','dismissDiscoveryLead',
  'loadAgentIntel','loadApolloLeads','loadSouthFloridaLeads','calcEV',
  'decayDays','fmtNum','log','toast'];

console.log('\n=== FUNCTION CHECK ===');
fns.forEach(f => {
  const ok = js.includes('function ' + f) || js.includes(f + '=function') || js.includes(f + ' = function') || js.includes('const ' + f) || js.includes('let ' + f);
  console.log((ok ? 'OK  ' : 'MISS') + '  ' + f);
});

// Check for unclosed template literals (backtick count must be even)
const bt = (js.match(/`/g)||[]).length;
console.log('\n=== SYNTAX HINTS ===');
console.log('Backticks (must be even):', bt, bt%2===0?'EVEN OK':'ODD - BROKEN');

// Try to find JS errors by checking brackets
let depth = 0, maxDepth = 0;
for(let i=0;i<js.length;i++){
  if(js[i]==='{') { depth++; if(depth>maxDepth) maxDepth=depth; }
  if(js[i]==='}') depth--;
}
console.log('Brace balance (0=ok):', depth);
console.log('Max nesting depth:', maxDepth);

// Check auth gate exists and has right structure
console.log('\n=== AUTH GATE ===');
console.log('auth-gate div:', h.includes('<div id="auth-gate">') ? 'OK' : 'MISSING');
console.log('auth-gate.hidden class:', h.includes('auth-gate.hidden') ? 'OK' : 'MISSING');
console.log('checkAuth fn:', h.includes('checkAuth') ? 'OK' : 'MISSING');

// Check data.js reference
console.log('\n=== DATA.JS ===');
console.log('script src data.js:', h.includes('src="data.js"') ? 'OK' : 'MISSING');

// Check CLAW global
console.log('window.CLAW:', h.includes('window.CLAW') || h.includes('CLAW.') ? 'OK' : 'MISSING');

// Show first 500 chars of JS to check for obvious breakage
console.log('\n=== JS START (first 300 chars) ===');
console.log(js.slice(0,300));

// Show last 200 chars
console.log('\n=== JS END (last 200 chars) ===');
console.log(js.slice(-200));
