const fs = require('fs');

function loadHtml(path) {
  const raw = fs.readFileSync(path);
  // Check for UTF-16 LE BOM
  if (raw[0] === 0xFF && raw[1] === 0xFE) {
    return raw.slice(2).toString('utf16le');
  }
  // Check for UTF-16 LE without BOM (null bytes in first chars)
  if (raw[1] === 0 && raw[3] === 0 && raw[5] === 0) {
    return raw.toString('utf16le');
  }
  return raw.toString('utf8');
}

function extractAuth(h) {
  const searchStr = 'id="auth-gate"';
  const i = h.indexOf(searchStr);
  if (i === -1) return '';
  let start = h.lastIndexOf('<div', i);
  let depth = 0, j = start;
  while (j < h.length) {
    if (h[j] === '<') {
      if (h.slice(j, j+4) === '<div') depth++;
      else if (h.slice(j, j+6) === '</div') { depth--; if (depth === 0) return h.slice(start, j+6); }
    }
    j++;
  }
  return '';
}

function extractModals(h) {
  const r = []; let f = 0;
  while (true) {
    const mi = h.indexOf('<div class="modal-overlay"', f);
    if (mi === -1) break;
    let d = 0, k = mi;
    while (k < h.length) {
      if (h[k] === '<') {
        if (h.slice(k, k+4) === '<div') d++;
        else if (h.slice(k, k+6) === '</div') { d--; if (d === 0) { r.push(h.slice(mi, k+6)); f = k+6; break; } }
      }
      k++;
    }
    if (f === 0) break;
  }
  return r.join('\n');
}

// Get auth from the auth-adding commit
const authSrc = loadHtml('_auth_src.html');
console.log('auth src size:', authSrc.length);
const auth = extractAuth(authSrc);
console.log('auth gate:', auth.length, 'chars');
if (auth) fs.writeFileSync('_auth_gate.html', auth);

// Get modals from the most recent working commit (source_clean = 4351c39)
const mainSrc = loadHtml('_source_utf8.html');
const modals = extractModals(mainSrc);
console.log('modals from 4351c39:', modals.length, 'chars');
// Try auth src for modals too
const modals2 = extractModals(authSrc);
console.log('modals from auth_src:', modals2.length, 'chars');

if (modals2.length > modals.length) {
  fs.writeFileSync('_modals.html', modals2);
  console.log('saved modals from auth_src');
} else if (modals.length > 0) {
  fs.writeFileSync('_modals.html', modals);
  console.log('saved modals from main_src');
} else {
  console.log('NO MODALS FOUND in either source');
}
