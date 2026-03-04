const fs = require('fs');
const h = fs.readFileSync('_source_utf8.html', 'utf8');

function extractJS(h) {
  const datajsIdx = h.indexOf('<script src="data.js">');
  const n = h.indexOf('<script>', datajsIdx);
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

const js   = extractJS(h);
const mods = extractModals(h);
const auth = extractAuth(h);

fs.writeFileSync('_orig_js.js', js);
fs.writeFileSync('_orig_mods.html', mods);
fs.writeFileSync('_orig_auth.html', auth);

console.log('JS:', Math.round(js.length/1024) + 'KB');
console.log('Modals:', mods.length, 'chars');
console.log('Auth:', auth.length, 'chars');

// Check for pollution
const polluted = ['_intelMounted', 'renderDiscoveryHero', 'updateIntelBanner', 'resetAndReloadAllLeads'];
polluted.forEach(name => {
  const count = js.split(name).length - 1;
  console.log(name + ':', count, count > 1 ? '*** DUPLICATE ***' : 'OK');
});

// Key functions exist?
const needed = ['renderAll', 'renderCommand', 'renderKanban', 'renderLeadTable',
  'checkAuth', 'loadState', 'calcEV', 'decayDays', 'fmtNum', 'log', 'toast',
  'loadAgentIntel', 'loadApolloLeads', 'loadSouthFloridaLeads',
  'importDiscoveryLead', 'dismissDiscoveryLead', 'setAutonomyMode',
  'openStrategicBrief', 'openAddLead', 'exportLeads', 'mountIntelSections',
  'renderObjections', 'renderMeetings', 'renderCampaigns', 'renderContent',
  'renderAgents', 'renderAuditLog', 'renderConstraintsList', 'renderForecast',
  'initSimulationForm', 'renderAnalytics', 'openStrategicBrief'];
const missing = needed.filter(f => !js.includes('function ' + f) && !js.includes(f + ' =') && !js.includes(f + '='));
if (missing.length) console.log('MISSING FUNCTIONS:', missing.join(', '));
else console.log('All', needed.length, 'required functions present');
