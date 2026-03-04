const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const js = h.slice(h.lastIndexOf('<script>') + 8, h.lastIndexOf('</script>'));

// Find the init / startup sequence
const initIdx = js.indexOf('window.addEventListener(\'load\'');
const init2Idx = js.indexOf('document.addEventListener(\'DOMContentLoaded\'');
console.log('window.load listener:', initIdx);
console.log('DOMContentLoaded listener:', init2Idx);

// show what runs at top level (not inside functions) to understand startup
// Find renderAll and renderCommand - what they actually do
const rcIdx = js.indexOf('\nfunction renderCommand(');
console.log('\n=== renderCommand body (400 chars) ===');
console.log(js.slice(rcIdx, rcIdx + 400));

// Find the DOMContentLoaded / load handler
if(init2Idx > -1) {
  console.log('\n=== ALL DOMContentLoaded blocks ===');
  let from = 0;
  while(true) {
    const idx = js.indexOf('DOMContentLoaded', from);
    if(idx === -1) break;
    console.log('  at pos', idx, ':', js.slice(idx, idx+100));
    from = idx + 1;
  }
}

// Find what runs on page init - look for checkSavedAuth or similar
const csaIdx = js.indexOf('checkSavedAuth');
const initStateIdx = js.indexOf('initState');
const loadStateIdx = js.indexOf('loadState');
console.log('\n=== Init functions ===');
console.log('checkSavedAuth:', csaIdx);
console.log('initState:', initStateIdx);
console.log('loadState:', loadStateIdx);
if(loadStateIdx > -1) console.log(js.slice(loadStateIdx, loadStateIdx+300));

// Find the original showPage definition
const spIdx = js.indexOf('\nfunction showPage(');
console.log('\n=== Original showPage (250 chars) ===');
console.log(js.slice(spIdx, spIdx+250));

// Find updateModeSelectorUI
const umIdx = js.indexOf('updateModeSelectorUI');
console.log('\n=== updateModeSelectorUI body ===');
console.log(js.slice(umIdx, umIdx+300));

// Find original showPipelineView
const spvIdx = js.indexOf('\nfunction showPipelineView(');
console.log('\n=== showPipelineView (200 chars) ===');
console.log(js.slice(spvIdx, spvIdx+200));
