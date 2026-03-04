const fs = require('fs');
const src = fs.readFileSync('_source_clean.html', 'utf8');

function extractJS(h) {
  const d = h.indexOf('<script src="data.js"></script>');
  const n = h.indexOf('<script>', d);
  return h.slice(n + 8, h.lastIndexOf('</script>'));
}
function extractModals(h) {
  const r = []; let f = 0;
  while (true) {
    const i = h.indexOf('<div class="modal-overlay"', f);
    if (i === -1) break;
    let d = 0, j = i;
    while (j < h.length) {
      if (h[j] === '<') {
        if (h.slice(j, j+4) === '<div') d++;
        else if (h.slice(j, j+6) === '</div') { d--; if (d === 0) { r.push(h.slice(i, j+6)); f = j+6; break; } }
      }
      j++;
    }
    if (f === 0) break;
  }
  return r.join('\n');
}
function extractAuth(h) {
  const i = h.indexOf('<div id="auth-gate">');
  if (i === -1) return '';
  let d = 0, j = i;
  while (j < h.length) {
    if (h[j] === '<') {
      if (h.slice(j, j+4) === '<div') d++;
      else if (h.slice(j, j+6) === '</div') { d--; if (d === 0) return h.slice(i, j+6); }
    }
    j++;
  }
  return '';
}

const js = extractJS(src);
const mods = extractModals(src);
const auth = extractAuth(src);

fs.writeFileSync('_orig_js.js', js);
fs.writeFileSync('_orig_mods.html', mods);
fs.writeFileSync('_orig_auth.html', auth);

console.log('JS:', Math.round(js.length/1024) + 'KB');
console.log('Modals:', mods.length, 'chars');
console.log('Auth:', auth.length, 'chars');
console.log('data.js ref in js:', js.includes('data.js'));

// Check for our override pollution
const polluted = ['_intelMounted','renderDiscoveryHero','updateIntelBanner','resetAndReloadAllLeads','_renderCommandCharts'];
polluted.forEach(name => {
  const count = (js.split(name).length - 1);
  console.log(name + ':', count, 'occurrences', count > 1 ? '*** DUPLICATE ***' : 'OK');
});
