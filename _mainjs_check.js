

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½ PAGE / ACCORDION NAVIGATION 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
let _pagesInited = false;
function showPage(pageId, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if(page) page.classList.add('active');
  document.querySelectorAll('.main-nav .nav-pill').forEach(n => n.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(pageId === 'pipeline') { renderKanban(); renderLeadTable(); }
  if(pageId === 'intel') { mountIntelSections(); renderAnalytics(); }
}
function showPipelineView(view, btn) {
  document.querySelectorAll('.pipeline-view').forEach(v => v.classList.remove('active'));
  const viewEl = document.getElementById('pview-' + view);
  if(viewEl) viewEl.classList.add('active');
  document.querySelectorAll('.pipeline-sub-nav .sub-pill').forEach(el => el.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(view === 'table') renderLeadTable();
  if(view === 'kanban') renderKanban();
}
function toggleIntelPanel(header) {
  const alreadyOpen = header.classList.contains('open');
  document.querySelectorAll('.accordion-header').forEach(h => {
    h.classList.remove('open');
    if(h.nextElementSibling) h.nextElementSibling.style.display = 'none';
  });
  if(!alreadyOpen) {
    header.classList.add('open');
    if(header.nextElementSibling) header.nextElementSibling.style.display = 'block';
  }
}

// Shim showSection for any legacy calls
function showSection(id, btn) {
  // no-op in 3-page layout; sections are in accordion or pages
}

// Mount section HTML into accordion containers
let _intelMounted = false;
function mountIntelSections() {
  if(_intelMounted) return;
  _intelMounted = true;
  const map = {
    'section-discovery-inner': `<div style="margin-bottom:16px"><div style="font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Discovery Mode</div><div class="discovery-toggle"><button id="disc-btn-OFF" class="disc-mode-btn active-off" onclick="setDiscoveryMode('OFF')">Off</button><button id="disc-btn-SEARCHING" class="disc-mode-btn" onclick="setDiscoveryMode('SEARCHING')">Searching</button><button id="disc-btn-PAUSED" class="disc-mode-btn" onclick="setDiscoveryMode('PAUSED')">Paused</button><button class="btn sm primary" onclick="runDiscoveryScan()">Run Scan</button></div><div style="margin-top:10px;display:flex;gap:8px;align-items:center"><input id="disc-webhook-input" type="text" placeholder="Webhook URL (optional)" style="flex:1;font-size:10px;padding:5px 8px" onchange="state.discoveryWebhook=this.value;saveState()"><span style="font-size:9px;color:var(--muted)">POST target for scan events</span></div></div><div style="font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Discovery Queue</div><div style="overflow-x:auto"><table><thead><tr><th>Source</th><th>Name</th><th>Organization</th><th>Vertical</th><th>Confidence</th><th>Intel</th><th>Actions</th></tr></thead><tbody id="discovery-queue-tbody"></tbody></table></div><div style="font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin:16px 0 8px">Discovery Log</div><div id="disc-log-list" class="disc-log"></div>`,
    'section-analytics-inner': "",
    'section-forecast-inner': "",
    'section-simulation-inner': "",
    'section-outreach-inner': "",
    'section-content-inner': "",
    'section-objections-inner': "",
    'section-meetings-inner': "",
    'section-agents-inner': "",
    'section-constraints-inner': "",
    'section-auditlog-inner': "",
  };
  Object.entries(map).forEach(([id, html]) => {
    const el = document.getElementById(id);
    if(el) el.innerHTML = html;
  });
  renderObjections(); renderMeetings(); renderCampaigns(); renderContent();
  renderAgents(); renderAuditLog(); renderConstraintsList(); renderForecast();
  initSimulationForm();
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½ MINI CHARTS ON COMMAND PAGE 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
let miniFunnelChart = null, miniDecayChart = null;
function renderCommandCharts() {
  const active = state.leads.filter(l=>!['Archived'].includes(l.status));
  // Mini funnel
  const stageLabels = window.CLAW.CONFIG.STAGES;
  const stageCounts = stageLabels.map(s => state.leads.filter(l=>l.status===s).length);
  const funnelEl = document.getElementById('mini-funnel-chart');
  if(funnelEl && window.Chart) {
    if(miniFunnelChart) miniFunnelChart.destroy();
    miniFunnelChart = new Chart(funnelEl, {
      type: 'bar',
      data: {
        labels: stageLabels,
        datasets: [{ data: stageCounts, backgroundColor: '#c8a84b55', borderColor: '#c8a84b', borderWidth: 1 }]
      },
      options: {
        indexAxis: 'y', plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#555566', font: { size: 9 } }, grid: { color: '#1e1e28' } },
          y: { ticks: { color: '#555566', font: { size: 9 } }, grid: { display: false } }
        }
      }
    });
  }
  // Mini decay donut
  const fresh = active.filter(l=>decayDays(l)<=1).length;
  const warn  = active.filter(l=>decayDays(l)>1 && decayDays(l)<=3).length;
  const crit  = active.filter(l=>decayDays(l)>3).length;
  const decayEl = document.getElementById('mini-decay-chart');
  if(decayEl && window.Chart) {
    if(miniDecayChart) miniDecayChart.destroy();
    miniDecayChart = new Chart(decayEl, {
      type: 'doughnut',
      data: {
        labels: ['Fresh', 'Warning', 'Critical'],
        datasets: [{ data: [fresh, warn, crit], backgroundColor: ['#2a9a4a55','#cc772255','#cc333355'], borderColor: ['#2a9a4a','#cc7722','#cc3333'], borderWidth: 1 }]
      },
      options: {
        cutout: '65%',
        plugins: { legend: { labels: { color: '#555566', font: { size: 9 }, boxWidth: 10 } } }
      }
    });
  }
}

// Override renderCommand to use new layout
const _origRenderCommand = typeof renderCommand !== 'undefined' ? renderCommand : null;


// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// CONFIG
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
if(!window.CLAW || !window.CLAW.CONFIG) {
  throw new Error('CLAW config missing. Ensure data.js is loaded before index.js');
}
const {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  STAGES,
  STAGE_MULT,
  DEFAULT_NBA,
  HARD_CONSTRAINTS,
  AGENT_DEFINITIONS,
  SCENARIO_PRESETS,
  AUTH: AUTH_CONFIG
} = window.CLAW.CONFIG;
const AUTH_META_KEY = 'clawbot_auth_meta';

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// STATE
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
let state = { leads:[], campaigns:[], content:[], meetings:[], objections:[], auditLog:[], agentOutputs:{}, conflicts:[], autonomyMode:'SEMI-AUTO' };
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if(raw) state = { ...state, ...JSON.parse(raw) };
  } catch(e){}
  normalizeState();
  if(!state.objections.length) seedObjections();
  saveState();
}
function normalizeState(){
  state.leads = (state.leads||[]).map(applyLeadDefaults);
  state.campaigns = state.campaigns||[];
  state.content = state.content||[];
  state.meetings = state.meetings||[];
  state.objections = state.objections||[];
  state.auditLog = state.auditLog||[];
  state.agentOutputs = state.agentOutputs||{};
  state.conflicts = state.conflicts||[];
  if(!state.autonomyMode) state.autonomyMode='SEMI-AUTO';
  state.discoveryMode = state.discoveryMode||'OFF';
  state.discoveryQueue = state.discoveryQueue||[];
  state.discoveryLog = state.discoveryLog||[];
  state.discoveryWebhook = state.discoveryWebhook||'';
}
function applyLeadDefaults(lead){
  return {
    ...lead,
    scoreEngagement: parseFloat(lead.scoreEngagement ?? 5) || 5,
    scoreSpeed: parseFloat(lead.scoreSpeed ?? 5) || 5,
    scoreFit: parseFloat(lead.scoreFit ?? 5) || 5,
    nbaPrimary: lead.nbaPrimary || '',
    nbaFallback: lead.nbaFallback || '',
    nbaEscalation: lead.nbaEscalation || '',
    psychProfile: lead.psychProfile || 'Unknown',
    manualHold: !!lead.manualHold,
    urgency: parseInt(lead.urgency ?? 2, 10) || 2,
    daysToClose: parseInt(lead.daysToClose ?? 30, 10) || 30,
    status: lead.status || 'Qualified',
    contactApproved: !!lead.contactApproved,
    discoveredBy: lead.discoveredBy || null
  };
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function log(action, detail='') {
  state.auditLog.unshift({ time:new Date().toISOString(), actor:'CLAWBOT', action, detail });
  if(state.auditLog.length > 500) state.auditLog = state.auditLog.slice(0,500);
  saveState();
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// AUTH
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
async function checkAuth(event) {
  if(event) event.preventDefault();
  const input = document.getElementById('auth-input');
  const errorEl = document.getElementById('auth-error');
  const meta = getAuthMeta();
  const now = Date.now();
  if(meta.lockedUntil && now < meta.lockedUntil) {
    const mins = Math.ceil((meta.lockedUntil - now) / 60000);
    errorEl.textContent = `LOCKED 뿯ν뿯½뿯½ retry in ${mins}m`;
    return;
  }
  const secret = (input.value || '').trim();
  if(!secret) {
    errorEl.textContent = '뿯ν뿯½뿯½ ENTER ACCESS PHRASE';
    return;
  }
  const valid = await verifySecret(secret);
  if(valid) {
    sessionStorage.setItem('claw_auth','1');
    sessionStorage.removeItem('claw_brief_seen');
    setAuthMeta({ attempts: 0, lockedUntil: 0 });
    errorEl.textContent = '';
    input.value = '';
    document.getElementById('auth-gate').classList.add('hidden');
    log('AUTH', 'Session unlocked');
    maybeAutoBrief();
  } else {
    meta.attempts = (meta.attempts || 0) + 1;
    if(meta.attempts >= AUTH_CONFIG.maxAttempts) {
      meta.lockedUntil = now + AUTH_CONFIG.lockMinutes * 60000;
      meta.attempts = 0;
      errorEl.textContent = `LOCKED 뿯ν뿯½뿯½ ${AUTH_CONFIG.lockMinutes}m cooldown`;
      log('AUTH FAIL', 'Max attempts hit');
    } else {
      errorEl.textContent = `뿯ν뿯½뿯½ ACCESS DENIED 뿯ν뿯½뿯½ ${AUTH_CONFIG.maxAttempts - meta.attempts} attempt(s) left`;
      log('AUTH FAIL', `Attempt ${meta.attempts}`);
    }
    setAuthMeta(meta);
    input.value = '';
  }
}
function initAuth() {
  const gate = document.getElementById('auth-gate');
  const errorEl = document.getElementById('auth-error');
  if(sessionStorage.getItem('claw_auth')==='1') {
    gate.classList.add('hidden');
    return;
  }
  const meta = getAuthMeta();
  if(meta.lockedUntil && Date.now() < meta.lockedUntil) {
    const mins = Math.ceil((meta.lockedUntil - Date.now())/60000);
    errorEl.textContent = `LOCKED 뿯ν뿯½뿯½ retry in ${mins}m`;
  }
}
function getAuthMeta() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_META_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function setAuthMeta(meta) {
  localStorage.setItem(AUTH_META_KEY, JSON.stringify(meta));
}
async function verifySecret(secret) {
  if(window.crypto?.subtle) {
    const salted = `${AUTH_CONFIG.salt}:${secret}`;
    const hash = await sha256Hex(salted);
    return hash === AUTH_CONFIG.passHash;
  }
  return secret === AUTH_CONFIG.legacyPass;
}
async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// SCORING ENGINE
// Lead Score = (Engagement├뿯½0.25)+(Speed├뿯½0.15)+(Channel├뿯½0.10)+(Sentiment├뿯½0.15)+(Recency├뿯½0.20)+(Fit├뿯½0.15)
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function calcScore(lead) {
  const e = (lead.scoreEngagement||5)/10;
  const sp = (lead.scoreSpeed||5)/10;
  const ch = 0.5; // default channel interaction
  const sent = 0.5; // default sentiment
  const fit = (lead.scoreFit||5)/10;
  // Recency decay
  let recency = 1.0;
  if(lead.lastTouch) {
    const daysSince = (Date.now() - new Date(lead.lastTouch).getTime()) / 86400000;
    if(daysSince > 7) recency = 0.2;
    else if(daysSince > 3) recency = 0.5;
    else if(daysSince > 1) recency = 0.75;
  }
  const raw = (e*0.25 + sp*0.15 + ch*0.10 + sent*0.15 + recency*0.20 + fit*0.15) * 100;
  return Math.round(Math.min(100, Math.max(0, raw)));
}
function scoreBadge(score) {
  let cls = score>=70?'score-hot':score>=50?'score-warm':score>=30?'score-cool':'score-cold';
  return `<span class="score-badge ${cls}">${score}</span>`;
}
function scoreColor(score) {
  return score>=70?'#ff6666':score>=50?'#ffaa44':score>=30?'#66cc88':'#555566';
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// DECAY RISK
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function decayDays(lead) {
  if(!lead.lastTouch) return 999;
  return (Date.now() - new Date(lead.lastTouch).getTime()) / 86400000;
}
function decayClass(lead) {
  const d = decayDays(lead);
  if(d > 3) return 'decay-hot';
  if(d > 1) return 'decay-warn';
  return 'decay-ok';
}
function decayLabel(lead) {
  const d = decayDays(lead);
  if(d > 7) return `<span class="decay-indicator decay-hot">뿯ν뿯½뿯½ ${Math.floor(d)}d STALE</span>`;
  if(d > 3) return `<span class="decay-indicator decay-hot">뿯ν뿯½╝ ${Math.floor(d)}d decay</span>`;
  if(d > 1) return `<span class="decay-indicator decay-warn">~ ${Math.floor(d)}d</span>`;
  return `<span class="decay-indicator decay-ok">뿯ν뿯½뿯½ Fresh</span>`;
}

function getLeadEV(lead) {
  const p = calcScore(lead)/100;
  const m = STAGE_MULT[lead.status] || 0.3;
  return p * (lead.value||0) * m;
}
function urgencyCoeff(lead) {
  const map={1:0.9,2:1,3:1.2};
  return map[lead.urgency] || 1;
}
function priorityScore(lead) {
  const ev = getLeadEV(lead);
  const days = Math.max(1, lead.daysToClose||30);
  return Math.round((ev * urgencyCoeff(lead)) / days);
}
function priorityLabel(score) {
  if(score>=8000) return {label:'Critical',cls:'priority-critical'};
  if(score>=3000) return {label:'High',cls:'priority-high'};
  if(score>=1200) return {label:'Med',cls:'priority-med'};
  return {label:'Low',cls:'priority-low'};
}
function priorityBadge(lead) {
  const meta = priorityLabel(priorityScore(lead));
  return `<span class="priority-badge ${meta.cls}">${meta.label}</span>`;
}
function getNBAStack(lead) {
  const primary = lead.nbaPrimary?.trim()?lead.nbaPrimary:(DEFAULT_NBA[lead.status]||'Advance to next stage');
  const fallback = lead.nbaFallback?.trim()?lead.nbaFallback:'Follow up within 48h';
  const escalation = lead.nbaEscalation?.trim()?lead.nbaEscalation:'Escalate to Roman';
  return { primary, fallback, escalation };
}
function shortProfile(profile){
  if(!profile) return 'Unknown';
  if(profile.startsWith('Authority')) return 'Authority';
  if(profile.startsWith('Analytical')) return 'Analytical';
  if(profile.startsWith('Collaborative')) return 'Collaborative';
  if(profile.startsWith('Political')) return 'Political';
  return profile;
}
function getPsychTone(profile){
  switch(profile){
    case 'Authority-Driven (Senior Military / SES)': return 'Lead with doctrine references, show chain-of-command respect, cite Roman oversight.';
    case 'Analytical (PM / Contracting Officer)': return 'Provide data, compliance hooks, contract vehicle clarity, measurable deltas.';
    case 'Collaborative (Civilian Director)': return 'Frame as co-build, emphasize shared governance + crisis drills.';
    case 'Political (Congressional / Policy)': return 'Prioritize constituent impact, bipartisan optics, immediate Roman escalation for GO/SES tiers.';
    default: return 'Default to mission-first calm with evidence-backed confidence.';
  }
}
function calculateRiskIndex(){
  const active=state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const decayCount=active.filter(l=>decayDays(l)>3).length;
  const decayPercent=active.length?decayCount/active.length:0;
  const conflicts=state.conflicts.filter(c=>c.status==='pending').length;
  return Math.min(100, Math.round(decayPercent*60 + conflicts*10));
}
function setAutonomyMode(mode) {
  state.autonomyMode = mode;
  saveState();
  log('MODE UPDATE', mode);
  updateModeSelectorUI();
  renderConstraintReminder();
  toast(`Autonomy mode 뿯ν뿯½뿯½ ${mode}`);
}
function updateModeSelectorUI() {
  document.querySelectorAll('#mode-selector .mode-btn').forEach(btn=>{
    if(btn.dataset.mode===state.autonomyMode) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// NAV
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('section-'+id).classList.add('active');
  if(btn) btn.classList.add('active');
  renderAll();
  if(id==='analytics') renderAnalytics();
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// RENDER ALL
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderAll() {
  updateTopBar();
  renderAlerts();
  renderCommand();
  renderKanban();
  renderLeadTable();
  renderForecast();
  renderCampaigns();
  renderContent();
  renderObjections();
  renderMeetings();
  renderAuditLog();
  renderAgents();
  renderConstraintsList();
  renderConstraintReminder();
  updateModeSelectorUI();
  renderDiscovery();
  updateConflictBadge();
  initSimulationForm();
  maybeAutoBrief();
}
function renderConstraintReminder(){
  const banner=document.getElementById('constraints-banner');
  if(!banner) return;
  banner.innerHTML=`<span>MODE: ${state.autonomyMode}</span> ┬╖ ${HARD_CONSTRAINTS.slice(0,3).join(' ┬╖ ')} ┬╖ Compliance lock`;
}
function updateConflictBadge(){
  const badge=document.getElementById('nav-conflict-badge');
  if(!badge) return;
  const pending=state.conflicts.filter(c=>c.status==='pending').length;
  if(pending){badge.style.display='inline-flex';badge.textContent=pending;}else{badge.style.display='none';}
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// TOP BAR
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function updateTopBar() {
  const active = state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const decay = active.filter(l=>decayDays(l)>1);
  const ev = active.reduce((s,l)=>{
    const p = calcScore(l)/100;
    const m = STAGE_MULT[l.status]||0.3;
    return s + p*(l.value||0)*m;
  },0);
  document.getElementById('tm-pipeline').textContent = '$'+fmtNum(ev);
  document.getElementById('tm-leads').textContent = active.length;
  document.getElementById('tm-decay').textContent = decay.length;
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// ALERTS
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderAlerts() {
  const c = document.getElementById('alert-container');
  if(!c) return;
  const blocks = [];
  state.leads.filter(l=>!['Closed','Archived'].includes(l.status)&&decayDays(l)>3).forEach(l=>{
    blocks.push(`<div class="alert-strip ${decayDays(l)>7?'danger':''}">
      <span>뿯ν뿯½뿯½ DECAY ALERT: <strong>${l.name}</strong> (${l.org}) 뿯ν뿯½뿯½ ${Math.floor(decayDays(l))}d idle. Stage: ${l.status}</span>
      <button class="btn sm warn" onclick="touchLead('${l.id}')">Log Touch</button>
    </div>`);
  });
  state.conflicts.filter(c=>c.status==='pending').forEach(conf=>{
    blocks.push(`<div class="alert-strip">
      <span>뿯ν뿯½뿯½ CONFLICT: <strong>${conf.deal}</strong> 뿯ν뿯½뿯½ ${conf.agentA} vs ${conf.agentB}</span>
      <button class="btn sm" onclick="resolveConflict('${conf.id}')">Resolve</button>
    </div>`);
  });
  c.innerHTML = blocks.join('') || '';
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// COMMAND CENTER
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderCommand() {
  const active = state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const decay = active.filter(l=>decayDays(l)>1);
  const stale = active.filter(l=>decayDays(l)>3);
  document.getElementById('cmd-total').textContent = state.leads.length;
  document.getElementById('cmd-active').textContent = active.length;
  document.getElementById('cmd-decay').textContent = decay.length;
  document.getElementById('cmd-stale').textContent = stale.length;
  document.getElementById('cmd-briefings').textContent = state.leads.filter(l=>l.status==='Briefing').length;
  document.getElementById('cmd-closed').textContent = state.leads.filter(l=>l.status==='Closed').length;

  // Contact Approvals stat
  const approvedLeads = active.filter(l=>l.contactApproved).length;
  const lockedLeads = active.length - approvedLeads;
  const caEl = document.getElementById('cmd-contact-approved');
  if(caEl) caEl.textContent = approvedLeads;
  const clEl = document.getElementById('cmd-contact-locked');
  if(clEl) clEl.textContent = lockedLeads+' locked';

  const holdEl=document.getElementById('hold-info');
  if(holdEl){
    const holds=state.leads.filter(l=>l.manualHold);
    holdEl.innerHTML = holds.length ? `<div class="info-panel"><strong>Manual Holds (${holds.length})</strong> 뿯ν뿯½뿯½ ${holds.map(h=>`${h.name} (${h.status})`).join(' ┬╖ ')}. Outreach + stage transitions locked.</div>` : '';
  }

  const stack = [...active].sort((a,b)=>priorityScore(b)-priorityScore(a)).slice(0,5);
  const hotEl = document.getElementById('cmd-hot-leads');
  if(hotEl) hotEl.innerHTML = stack.length ? stack.map(l=>{
    const nba=getNBAStack(l);
    return `<div style="background:var(--surface);border:1px solid var(--border);border-left:3px solid ${scoreColor(calcScore(l))};padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;gap:12px">
      <div>
        <div style="font-size:12px">${l.name} ${l.manualHold?'<span class="hold-badge">HOLD</span>':''}</div>
        <div style="font-size:10px;color:var(--muted)">${l.org} ┬╖ ${l.status} ┬╖ ${decayLabel(l)}</div>
        <div style="font-size:10px;color:#9ec5ff;margin-top:4px">NBA: ${nba.primary}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        ${priorityBadge(l)}
        <button class="btn sm primary" onclick="openDossier('${l.id}')">Dossier</button>
      </div>
    </div>`;
  }).join('') : '<div style="color:var(--muted);padding:12px;font-size:11px">No active leads. Add your first lead.</div>';

  const ev = calcEV();
  const fEl = document.getElementById('cmd-forecast-mini');
  if(fEl) fEl.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <div style="background:var(--surface);border:1px solid var(--border);padding:12px;text-align:center">
        <div style="font-size:18px;color:var(--muted);font-weight:bold">$${fmtNum(ev.conservative)}</div>
        <div style="font-size:9px;color:var(--muted);margin-top:3px">CONSERVATIVE</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--accent);padding:12px;text-align:center">
        <div style="font-size:18px;color:var(--accent);font-weight:bold">$${fmtNum(ev.base)}</div>
        <div style="font-size:9px;color:var(--muted);margin-top:3px">BASE CASE</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--success);padding:12px;text-align:center">
        <div style="font-size:18px;color:var(--success);font-weight:bold">$${fmtNum(ev.upside)}</div>
        <div style="font-size:9px;color:var(--muted);margin-top:3px">UPSIDE</div>
      </div>
    </div>`;

  const oEl = document.getElementById('cmd-objections-mini');
  if(oEl) {
    const top = state.objections.slice(0,3);
    oEl.innerHTML = top.length ? top.map(o=>`
      <div style="background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--warn);padding:10px 14px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:11px;color:var(--warn)">${o.type}</span>
          <span class="tag ${o.outcome==='converted'?'green':o.outcome==='lost'?'red':o.outcome==='stalled'?'warn':'amber'}">${o.outcome}</span>
        </div>
        <div style="font-size:10px;color:#888">${o.counter||'No counter recorded'}</div>
      </div>`).join('') : '<div style="color:var(--muted);font-size:11px;padding:8px">No objections logged yet. Log patterns as you encounter them.</div>';
  }
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// KANBAN
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
let dragId = null;
function renderKanban() {
  const board = document.getElementById('kanban-board');
  if(!board) return;
  board.innerHTML = '';
  STAGES.forEach(stage=>{
    const leads = state.leads.filter(l=>l.status===stage);
    const col = document.createElement('div');
    col.className = 'kanban-col';
    col.innerHTML = `
      <div class="kanban-col-header">
        <span class="kanban-col-title">${stage}</span>
        <span class="kanban-col-count">${leads.length}</span>
      </div>
      <div class="kanban-col-body">
        ${leads.map(l=>{
          const score = calcScore(l);
          const dc = decayClass(l);
          const nba = getNBAStack(l);
          const lockBadge = l.contactApproved ? '' : ' <span class="lock-badge" title="Outreach locked">≡뿯ƽ뿯½뿯½</span>';
          const agentBadge = l.discoveredBy==='AGENT' ? ' <span class="agent-badge">AGENT</span>' : '';
          return `<div class="kanban-card ${dc}" draggable="true" id="kc-${l.id}"
            ondragstart="dragStart('${l.id}')" ondragend="dragEnd()">
            <div class="card-name">${l.name}${lockBadge}${agentBadge} ${l.manualHold?'<span class="hold-badge">HOLD</span>':''}</div>
            <div class="card-org">${l.org}</div>
            <div class="card-score-bar"><div class="card-score-fill" style="width:${score}%;background:${scoreColor(score)}"></div></div>
            <div class="card-score-label">${priorityBadge(l)} ┬╖ ${decayLabel(l)}</div>
            <div style="font-size:10px;color:#9ec5ff;margin-bottom:6px">NBA: ${nba.primary}</div>
            <div class="card-actions">
              <button class="btn sm" onclick="openEditLead('${l.id}')">Edit</button>
              <button class="btn sm primary" onclick="openDossier('${l.id}')">Dossier</button>
              <button class="btn sm success" onclick="touchLead('${l.id}')">Touch</button>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    col.addEventListener('dragover', e=>{ e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', ()=>col.classList.remove('drag-over'));
    col.addEventListener('drop', e=>{
      e.preventDefault(); col.classList.remove('drag-over');
      if(dragId){
        const l=state.leads.find(x=>x.id===dragId);
        if(l){
          if(l.manualHold){ toast('Manual hold active 뿯ν뿯½뿯½ stage locked'); return; }
          if(l.status!==stage){ log(`STAGE: ${l.name}`,`${l.status}뿯ν뿯½뿯½${stage}`); l.status=stage; l.lastTouch=new Date().toISOString(); saveState(); renderAll(); }
        }
      }
    });
    board.appendChild(col);
  });
}
function dragStart(id){ dragId=id; document.getElementById('kc-'+id)?.classList.add('dragging'); }
function dragEnd(){ dragId=null; document.querySelectorAll('.kanban-card').forEach(c=>c.classList.remove('dragging')); }

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// LEAD TABLE
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderLeadTable() {
  const tb = document.getElementById('lead-tbody');
  if(!tb) return;
  const sorted = [...state.leads].sort((a,b)=>{
    const diff = priorityScore(b)-priorityScore(a);
    if(diff!==0) return diff;
    return calcScore(b)-calcScore(a);
  });
  tb.innerHTML = sorted.map(l=>{
    const nba=getNBAStack(l);
    const lockBadge = l.contactApproved ? '' : ' <span class="lock-badge" title="Outreach locked 뿯ν뿯½뿯½ approval required">≡뿯ƽ뿯½뿯½</span>';
    const agentBadge = l.discoveredBy==='AGENT' ? ' <span class="agent-badge">AGENT</span>' : '';
    const outreachDisabled = !l.contactApproved ? 'disabled title="Contact not approved 뿯ν뿯½뿯½ click Dossier to approve"' : '';
    return `<tr>
      <td>${scoreBadge(calcScore(l))}</td>
      <td>${l.name}${lockBadge}${agentBadge} ${l.manualHold?'<span class="hold-badge">HOLD</span>':''}</td>
      <td>${l.org}</td>
      <td><span class="tag amber">${l.vertical}</span></td>
      <td>
        <select onchange="changeStatus('${l.id}',this)" ${l.manualHold?'disabled':''} style="width:100%;max-width:140px">
          ${[...STAGES,'Archived'].map(s=>`<option${s===l.status?' selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>${decayLabel(l)}</td>
      <td>${priorityBadge(l)}<div style="font-size:10px;color:var(--muted)">${priorityScore(l)} pts</div></td>
      <td style="font-size:11px;color:#9ec5ff">${nba.primary}</td>
      <td>${shortProfile(l.psychProfile)}</td>
      <td style="color:var(--accent)">${l.value?'$'+fmtNum(l.value):'뿯ν뿯½뿯½'}</td>
      <td><div style="display:flex;gap:3px;flex-wrap:wrap">
        <button class="btn sm" onclick="openEditLead('${l.id}')">Edit</button>
        <button class="btn sm primary" onclick="openDossier('${l.id}')">Dossier</button>
        <button class="btn sm success" onclick="touchLead('${l.id}')">Touch</button>
        <button class="btn sm warn" onclick="triggerSequenceForLead('${l.id}')" ${outreachDisabled}>≡뿯ƽ뿯½뿯½ Outreach</button>
        <button class="btn sm danger" onclick="deleteLead('${l.id}')">Del</button>
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="11" style="color:var(--muted);text-align:center;padding:24px">No leads. Add your first lead.</td></tr>';
}

function changeStatus(id, selectEl) {
  const l=state.leads.find(x=>x.id===id);
  if(!l) return;
  if(l.manualHold){ toast('Manual hold active 뿯ν뿯½뿯½ status locked'); if(selectEl) selectEl.value=l.status; return; }
  const status=selectEl.value;
  if(status===l.status) return;
  log(`STATUS: ${l.name}`,`뿯ν뿯½뿯½${status}`);
  l.status=status;
  l.lastTouch=new Date().toISOString();
  saveState();
  renderAll();
}
function touchLead(id) {
  const l=state.leads.find(x=>x.id===id);
  if(l){ l.lastTouch=new Date().toISOString(); log(`TOUCH: ${l.name}`,'Contact logged'); saveState(); renderAll(); toast(`Touch logged: ${l.name}`); }
}
function deleteLead(id) {
  if(!confirm('Delete this lead?')) return;
  const l=state.leads.find(x=>x.id===id); if(l) log(`DELETED: ${l.name}`);
  state.leads=state.leads.filter(x=>x.id!==id); saveState(); renderAll();
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// FORECAST ENGINE
// EV = P(close) ├뿯½ deal_value ├뿯½ stage_mult ├뿯½ urgency_coeff
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function calcEV() {
  let base=0;
  state.leads.filter(l=>!['Archived'].includes(l.status)).forEach(l=>{
    const p = calcScore(l)/100;
    const m = STAGE_MULT[l.status]||0.3;
    const v = l.value||0;
    base += p*v*m;
  });
  return {
    conservative: base*0.7,
    base,
    upside: Math.min(base*1.3, state.leads.reduce((s,l)=>s+(l.value||0),0))
  };
}

function renderForecast() {
  const ev = calcEV();
  const fc = document.getElementById('fc-conservative');
  if(!fc) return;
  document.getElementById('fc-conservative').textContent = '$'+fmtNum(ev.conservative);
  document.getElementById('fc-base').textContent = '$'+fmtNum(ev.base);
  document.getElementById('fc-upside').textContent = '$'+fmtNum(ev.upside);

  // Stage bars
  const barsEl = document.getElementById('pipeline-bars');
  if(barsEl){
    const maxEV = Math.max(...STAGES.map(s=>{
      return state.leads.filter(l=>l.status===s).reduce((sum,l)=>{
        return sum + (calcScore(l)/100)*(l.value||0)*(STAGE_MULT[s]||0.3);
      },0);
    }),1);
    barsEl.innerHTML = STAGES.map(s=>{
      const stageLeads = state.leads.filter(l=>l.status===s);
      const stageEV = stageLeads.reduce((sum,l)=>sum+(calcScore(l)/100)*(l.value||0)*(STAGE_MULT[s]||0.3),0);
      const pct = Math.round((stageEV/maxEV)*100);
      return `<div class="pipeline-row">
        <div class="pipeline-stage-label">${s}</div>
        <div class="pipeline-bar-wrap">
          <div class="pipeline-bar-fill" style="width:${pct}%"></div>
          <div class="pipeline-bar-label">${stageLeads.length} leads</div>
        </div>
        <div class="pipeline-ev">$${fmtNum(stageEV)}</div>
      </div>`;
    }).join('');
  }

  // Forecast table
  const ftb = document.getElementById('forecast-tbody');
  if(ftb){
    const leads = [...state.leads].filter(l=>l.status!=='Archived').sort((a,b)=>{
      const aEV=(calcScore(a)/100)*(a.value||0)*(STAGE_MULT[a.status]||0.3);
      const bEV=(calcScore(b)/100)*(b.value||0)*(STAGE_MULT[b.status]||0.3);
      return bEV-aEV;
    });
    ftb.innerHTML = leads.map(l=>{
      const p=calcScore(l)/100;
      const m=STAGE_MULT[l.status]||0.3;
      const ev2=p*(l.value||0)*m;
      return `<tr>
        <td>${l.name}<div style="font-size:10px;color:var(--muted)">${l.org}</div></td>
        <td><span class="tag ${stageTag(l.status)}">${l.status}</span></td>
        <td>${scoreBadge(calcScore(l))}</td>
        <td>${l.value?'$'+fmtNum(l.value):'뿯ν뿯½뿯½'}</td>
        <td>${Math.round(p*100)}%</td>
        <td>${m}</td>
        <td style="color:var(--accent);font-weight:bold">$${fmtNum(ev2)}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:16px">No leads to forecast.</td></tr>';
  }
}

function stageTag(s){
  const map={Qualified:'gray',Briefing:'blue',Proposal:'amber',Negotiation:'warn',Verbal:'green',Closed:'green',Archived:'gray'};
  return map[s]||'gray';
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// CAMPAIGNS
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderCampaigns() {
  const el=document.getElementById('campaigns-list');
  if(!el) return;
  if(!state.campaigns.length){ el.innerHTML='<div style="color:var(--muted);padding:24px;text-align:center;font-size:11px">No campaigns running. Trigger one above.</div>'; return; }
  el.innerHTML = state.campaigns.map(c=>`
    <div class="sequence-card">
      <div class="sequence-header">
        <div><div class="sequence-title">${c.name}</div><div class="sequence-meta">${c.type} ┬╖ ${c.vertical} ┬╖ <span class="tag ${c.status==='Active'?'green':c.status==='Completed'?'blue':'gray'}">${c.status}</span></div></div>
        <div style="font-size:10px;color:var(--muted)">${new Date(c.created).toLocaleDateString()}</div>
      </div>
      <div class="sequence-steps">${c.steps.map(s=>`<div class="step ${s.done?'done':s===c.steps.find(x=>!x.done)?'active':''}"><div>${s.day}</div><div style="font-size:8px">${s.label}</div></div>`).join('')}</div>
      <div class="sequence-actions">
        <button class="btn sm success" onclick="advanceStep('${c.id}')">뿯ν뿯½뿯½ Mark Step Done</button>
        <button class="btn sm primary" onclick="addTouchpoint('${c.id}')">Log Touchpoint</button>
        ${c.status==='Active'?`<button class="btn sm danger" onclick="pauseCampaign('${c.id}')">Pause</button>`:`<button class="btn sm success" onclick="resumeCampaign('${c.id}')">Resume</button>`}
        <button class="btn sm danger" onclick="deleteCampaign('${c.id}')">Delete</button>
      </div>
    </div>`).join('');
}
function advanceStep(id){
  const c=state.campaigns.find(x=>x.id===id); if(!c) return;
  const n=c.steps.find(s=>!s.done);
  if(n){n.done=true;log(`STEP DONE: ${c.name}`,n.label);}
  else{c.status='Completed';log(`CAMPAIGN COMPLETE: ${c.name}`);}
  saveState();renderAll();
}
function pauseCampaign(id){const c=state.campaigns.find(x=>x.id===id);if(c){c.status='Paused';log(`PAUSED: ${c.name}`);saveState();renderAll();}}
function resumeCampaign(id){const c=state.campaigns.find(x=>x.id===id);if(c){c.status='Active';log(`RESUMED: ${c.name}`);saveState();renderAll();}}
function deleteCampaign(id){const c=state.campaigns.find(x=>x.id===id);if(c)log(`DELETED CAMPAIGN: ${c.name}`);state.campaigns=state.campaigns.filter(x=>x.id!==id);saveState();renderAll();}
function addTouchpoint(id){
  const n=prompt('Log touchpoint note:');
  if(n){const c=state.campaigns.find(x=>x.id===id);log(`TOUCHPOINT: ${c?.name||id}`,n);saveState();renderAll();toast('Touchpoint logged');}
}
function triggerSequenceForLead(id){
  const l=state.leads.find(x=>x.id===id);if(!l)return;
  if(l.manualHold){toast('Manual hold active 뿯ν뿯½뿯½ outreach blocked');return;}
  if(!l.contactApproved){toast('≡뿯ƽ뿯½뿯½ Contact not approved 뿯ν뿯½뿯½ open Dossier to approve outreach');return;}
  state.campaigns.push({id:uid(),name:`Outreach 뿯ν뿯½뿯½ ${l.name}`,vertical:l.vertical,type:'Email Drip (D1뿯ν뿯½뿯½D4뿯ν뿯½뿯½D10)',brief:l.notes||'Trestleboard capability intro',created:new Date().toISOString(),status:'Active',steps:[{day:'D1',label:'First Touch',done:true},{day:'D4',label:'Follow-Up',done:false},{day:'D10',label:'Final Push',done:false}]});
  l.lastTouch=new Date().toISOString();
  log(`CAMPAIGN TRIGGERED: ${l.name}`,'Email Drip initiated');
  saveState();renderAll();toast(`Campaign launched: ${l.name}`);
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// CONTENT QUEUE
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderContent(){
  const el=document.getElementById('content-list');if(!el)return;
  if(!state.content.length){el.innerHTML='<div style="color:var(--muted);padding:24px;text-align:center;font-size:11px">No content in queue. Submit a brief.</div>';return;}
  el.innerHTML=state.content.map(c=>`
    <div class="queue-card" style="border-left-color:${c.status==='Approved'||c.status==='Deployed'?'var(--success)':c.status==='Rejected'?'var(--danger)':c.priority==='URGENT'?'var(--danger)':'var(--accent)'}">
      <div class="queue-card-header">
        <div><div class="queue-card-title">${c.title} ${c.priority==='URGENT'?'<span class="tag red">URGENT</span>':''}</div><div class="queue-card-meta">${c.type} ┬╖ ${new Date(c.created).toLocaleDateString()}</div></div>
        <span class="tag ${c.status==='Approved'||c.status==='Deployed'?'green':c.status==='Rejected'?'red':'amber'}">${c.status}</span>
      </div>
      <div class="queue-card-body">${c.body}</div>
      <div style="font-size:10px;color:var(--muted);margin-bottom:10px">Channels: ${c.channels.join(' ┬╖ ')}</div>
      <div class="queue-card-actions">
        ${c.status==='Pending'?`<button class="btn sm success" onclick="approveContent('${c.id}')">뿯ν뿯½뿯½ Approve</button><button class="btn sm danger" onclick="rejectContent('${c.id}')">뿯ν뿯½뿯½ Reject</button>`:''}
        ${c.status==='Approved'?`<button class="btn sm primary" onclick="deployContent('${c.id}')">≡뿯ƽ뿯½뿯½ Deploy</button>`:''}
        <button class="btn sm" onclick="deleteContent('${c.id}')">Delete</button>
      </div>
    </div>`).join('');
}
function approveContent(id){const c=state.content.find(x=>x.id===id);if(c){c.status='Approved';log(`APPROVED: ${c.title}`);saveState();renderAll();toast('Approved');}}
function rejectContent(id){const c=state.content.find(x=>x.id===id);if(c){c.status='Rejected';log(`REJECTED: ${c.title}`);saveState();renderAll();}}
function deployContent(id){const c=state.content.find(x=>x.id===id);if(c){c.status='Deployed';log(`DEPLOYED: ${c.title}`,c.channels.join(', '));saveState();renderAll();toast(`Deployed to ${c.channels.join(', ')}`);}}
function deleteContent(id){const c=state.content.find(x=>x.id===id);if(c)log(`DELETED CONTENT: ${c.title}`);state.content=state.content.filter(x=>x.id!==id);saveState();renderAll();}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// OBJECTION REGISTRY
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderObjections(){
  const el=document.getElementById('objections-list');if(!el)return;
  if(!state.objections.length){el.innerHTML='<div style="color:var(--muted);padding:24px;text-align:center;font-size:11px">No objections logged. Record patterns as you encounter them in the field 뿯ν뿯½뿯½ they become your playbook.</div>';return;}
  el.innerHTML=state.objections.map(o=>`
    <div class="obj-card">
      <div class="obj-header">
        <div><div class="obj-type">${o.type}</div><div class="obj-vertical">${o.vertical}</div></div>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="tag ${o.outcome==='converted'?'green':o.outcome==='lost'?'red':o.outcome==='stalled'?'warn':'gray'}">${o.outcome}</span>
          <button class="btn sm" onclick="editObjection('${o.id}')">Edit</button>
          <button class="btn sm danger" onclick="deleteObjection('${o.id}')">Del</button>
        </div>
      </div>
      <div style="font-size:11px;color:#777;margin-bottom:8px;font-style:italic">"${o.text}"</div>
      <div class="obj-counter"><strong style="color:var(--muted);font-size:9px;letter-spacing:1px">COUNTER:</strong><br>${o.counter||'No counter recorded'}</div>
    </div>`).join('');
}
function openAddObjection(){document.getElementById('obj-id').value='';['obj-type','obj-text','obj-counter'].forEach(id=>document.getElementById(id).value='');document.getElementById('obj-outcome').value='pending';openModal('modal-objection');}
function editObjection(id){
  const o=state.objections.find(x=>x.id===id);if(!o)return;
  document.getElementById('obj-id').value=o.id;
  document.getElementById('obj-type').value=o.type;
  document.getElementById('obj-vertical').value=o.vertical;
  document.getElementById('obj-text').value=o.text;
  document.getElementById('obj-counter').value=o.counter||'';
  document.getElementById('obj-outcome').value=o.outcome;
  openModal('modal-objection');
}
function saveObjection(){
  const id=document.getElementById('obj-id').value;
  const data={type:document.getElementById('obj-type').value.trim(),vertical:document.getElementById('obj-vertical').value,text:document.getElementById('obj-text').value.trim(),counter:document.getElementById('obj-counter').value.trim(),outcome:document.getElementById('obj-outcome').value};
  if(!data.type||!data.text){alert('Objection type and text required.');return;}
  if(id){Object.assign(state.objections.find(x=>x.id===id),data);log(`OBJ UPDATED: ${data.type}`);}
  else{state.objections.push({id:uid(),...data,created:new Date().toISOString()});log(`OBJ LOGGED: ${data.type}`,data.vertical);}
  saveState();closeModal('modal-objection');renderAll();toast('Objection logged');
}
function deleteObjection(id){state.objections=state.objections.filter(x=>x.id!==id);log('OBJ DELETED');saveState();renderAll();}
function seedObjections(){
  const seeds=[
    {type:'Budget / No Vehicle',text:'"Budget is frozen unless we find the right vehicle."',counter:'Identify matching OTA, IDIQ, or sole-source authority. Frame as prototype under OTA.',vertical:'Federal DoD',outcome:'pending'},
    {type:'Incumbent Vendor',text:'"Our incumbent already covers this."',counter:'AI-native vs legacy. 200+ variants vs 3-5. Augmentation framing, not replacement.',vertical:'Federal DoD',outcome:'pending'},
    {type:'Timeline Pressure',text:'"We cannot wait 6 months."',counter:'Rapid deployment narrative. 30-day pilot. API-first = integration in days.',vertical:'Federal DoD',outcome:'pending'},
    {type:'Clearance Requirements',text:'"Need cleared staff before we move."',counter:'Cleared staff on standby. Teaming partners available for TS/SCI lanes.',vertical:'Federal DoD',outcome:'pending'}
  ];
  state.objections = seeds.map(s=>({id:uid(),...s,created:new Date().toISOString()}));
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// MEETINGS
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderMeetings(){
  const el=document.getElementById('meetings-list');if(!el)return;
  if(!state.meetings.length){el.innerHTML='<div style="color:var(--muted);padding:24px;text-align:center;font-size:11px">No briefings scheduled.</div>';return;}
  el.innerHTML=state.meetings.map(m=>{
    const l=state.leads.find(x=>x.id===m.leadId);
    return `<div class="meeting-card">
      <div class="meeting-header">
        <div><div style="font-size:13px">${l?l.name:'Unknown'}</div><div style="font-size:10px;color:var(--muted)">${l?l.org:''} ┬╖ ${m.format}</div></div>
        <div style="text-align:right"><div style="color:var(--accent);font-size:12px">${m.datetime?new Date(m.datetime).toLocaleString():'뿯ν뿯½뿯½'}</div><span class="tag ${m.outcome==='Won'?'green':m.outcome==='Lost'?'red':'amber'}">${m.outcome||'Scheduled'}</span></div>
      </div>
      ${m.notes?`<div style="font-size:11px;color:#888;margin-bottom:12px">${m.notes}</div>`:''}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn sm primary" onclick="openDossier('${m.leadId}')">Dossier</button>
        <button class="btn sm success" onclick="setOutcome('${m.id}','Won')">Mark Won</button>
        <button class="btn sm danger" onclick="setOutcome('${m.id}','Lost')">Mark Lost</button>
        <button class="btn sm" onclick="deleteMeeting('${m.id}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}
function setOutcome(id,outcome){
  const m=state.meetings.find(x=>x.id===id);if(!m)return;
  m.outcome=outcome;
  const l=state.leads.find(x=>x.id===m.leadId);
  if(l&&outcome==='Won'){l.status='Closed';l.lastTouch=new Date().toISOString();}
  log(`MEETING ${outcome}: ${l?.name||id}`);
  saveState();renderAll();
}
function deleteMeeting(id){state.meetings=state.meetings.filter(x=>x.id!==id);log('MEETING DELETED');saveState();renderAll();}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// AUDIT LOG
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function renderAuditLog(){
  const el=document.getElementById('audit-log-list');if(!el)return;
  if(!state.auditLog.length){el.innerHTML='<div style="color:var(--muted);padding:24px;text-align:center">No events logged.</div>';return;}
  el.innerHTML=state.auditLog.slice(0,300).map(e=>`
    <div class="log-entry">
      <span class="log-time">${new Date(e.time).toLocaleString()}</span>
      <span class="log-actor">${e.actor}</span>
      <span class="log-action">${e.action}${e.detail?' 뿯ν뿯½뿯½ '+e.detail:''}</span>
    </div>`).join('');
}
function clearLog(){if(confirm('Clear audit log?')){state.auditLog=[];saveState();renderAll();}}
function exportLog(){
  const csv=['Time,Actor,Action,Detail',...state.auditLog.map(e=>`"${e.time}","${e.actor}","${e.action}","${e.detail||''}"`)].join('\n');
  dl('clawbot-audit.csv',csv,'text/csv');log('EXPORTED: Audit Log');
}

function renderAgents(){
  const grid=document.getElementById('agent-grid');
  if(grid){
    grid.innerHTML=AGENT_DEFINITIONS.map(agent=>{
      const output=state.agentOutputs[agent.id]||'Awaiting directive.';
      const conflictFlag=state.conflicts.some(c=>c.status==='pending' && ((c.agentA||'').includes(agent.name)||(c.agentB||'').includes(agent.name)));
      return `<div class="agent-card">
        <div class="agent-meta">
          <h4>${agent.name}</h4>
          <span>${agent.confidence}% CONF</span>
        </div>
        <p>${agent.role}</p>
        ${conflictFlag?'<span class="agent-conflict">CONFLICT PENDING</span>':''}
        <p style="color:#cfd6ff">${output}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn sm" onclick="logAgentOutput('${agent.id}')">Log Output</button>
        </div>
      </div>`;
    }).join('');
  }
  const list=document.getElementById('conflict-list');
  if(list){
    if(!state.conflicts.length){list.innerHTML='<div style="color:var(--muted);padding:12px;font-size:11px">No conflicts logged.</div>';return;}
    list.innerHTML=state.conflicts.map(conf=>`
      <div class="conflict-item">
        <h5>${conf.deal}</h5>
        <p>${conf.agentA} 뿯ν뿯½뿯½ ${conf.agentB}</p>
        <p style="font-size:10px;color:var(--muted)">Options: ${conf.options||'뿯ν뿯½뿯½'}</p>
        ${conf.resolution?`<p style="font-size:10px;color:var(--success)">Resolution: ${conf.resolution}</p>`:''}
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="conflict-status ${conf.status==='pending'?'pending':'resolved'}">${conf.status}</span>
          <button class="btn sm" onclick="openConflictModal('${conf.id}')">Edit</button>
          ${conf.status==='pending'?`<button class="btn sm success" onclick="resolveConflict('${conf.id}')">Resolve</button>`:''}
        </div>
      </div>`).join('');
  }
}
function logAgentOutput(agentId){
  const agent=AGENT_DEFINITIONS.find(a=>a.id===agentId);
  const note=prompt(`Log output for ${agent?.name||agentId}:`);
  if(!note)return;
  state.agentOutputs[agentId]=note;
  log('AGENT OUTPUT',`${agent?.name||agentId}`);
  saveState();renderAgents();toast('Agent output updated');
}
function syncAgentOutputs(){
  log('AGENT SYNC','Manual refresh');
  renderAgents();
  toast('Agent grid refreshed');
}
function openConflictModal(id){
  const conf=id?state.conflicts.find(c=>c.id===id):null;
  document.getElementById('conflict-id').value=conf?.id||'';
  document.getElementById('conflict-deal').value=conf?.deal||'';
  document.getElementById('conflict-agent-a').value=conf?.agentA||'';
  document.getElementById('conflict-agent-b').value=conf?.agentB||'';
  document.getElementById('conflict-options').value=conf?.options||'';
  document.getElementById('conflict-status').value=conf?.status||'pending';
  document.getElementById('conflict-resolution').value=conf?.resolution||'';
  openModal('modal-conflict');
}
function saveConflict(){
  const id=document.getElementById('conflict-id').value;
  const data={
    deal:document.getElementById('conflict-deal').value.trim(),
    agentA:document.getElementById('conflict-agent-a').value.trim(),
    agentB:document.getElementById('conflict-agent-b').value.trim(),
    options:document.getElementById('conflict-options').value.trim(),
    status:document.getElementById('conflict-status').value,
    resolution:document.getElementById('conflict-resolution').value.trim()
  };
  if(!data.deal||!data.agentA||!data.agentB){alert('Deal and agent positions required.');return;}
  if(data.status==='resolved' && !data.resolution){alert('Resolution text required.');return;}
  if(id){Object.assign(state.conflicts.find(c=>c.id===id),data);log('CONFLICT UPDATED',data.deal);}
  else {state.conflicts.push({id:uid(),...data,created:new Date().toISOString()});log('CONFLICT LOGGED',data.deal);}
  saveState();closeModal('modal-conflict');renderAll();
}
function resolveConflict(id){
  const conf=state.conflicts.find(c=>c.id===id);if(!conf)return;
  const note=prompt('Resolution / decision text:');
  if(!note)return;
  conf.status='resolved';
  conf.resolution=note;
  conf.resolvedAt=new Date().toISOString();
  log('CONFLICT RESOLVED',conf.deal);
  saveState();renderAll();toast('Conflict resolved');
}

function renderConstraintsList(){
  const list=document.getElementById('constraints-list');
  if(list) list.innerHTML = HARD_CONSTRAINTS.map((rule,idx)=>`<li>${rule}</li>`).join('');
}
function initSimulationForm(){
  if(simulationInitialized) return;
  applyScenarioPreset(document.getElementById('sim-scenario')?.value||'outreach_freq');
  simulationInitialized=true;
}
function resetSimulationForm(){
  const sel=document.getElementById('sim-scenario');
  if(sel){sel.value='outreach_freq';}
  applyScenarioPreset('outreach_freq');
  document.getElementById('sim-output').textContent='Awaiting simulation...';
}
function applyScenarioPreset(key){
  const preset=SCENARIO_PRESETS[key];
  if(!preset) return;
  const urgency=document.getElementById('sim-urgency');
  const conv=document.getElementById('sim-conv');
  const cycle=document.getElementById('sim-cycle');
  const notes=document.getElementById('sim-notes');
  if(urgency && preset.urgency) urgency.value=preset.urgency;
  if(conv) conv.value=preset.convDelta;
  if(cycle) cycle.value=preset.cycleDelta;
  if(notes && preset.notes) notes.value=preset.notes;
}
function runSimulation(){
  const scenarioKey=document.getElementById('sim-scenario').value;
  const preset=SCENARIO_PRESETS[scenarioKey]||SCENARIO_PRESETS.custom;
  const urgency=parseFloat(document.getElementById('sim-urgency').value)||1;
  const conv=parseFloat(document.getElementById('sim-conv').value)||0;
  const cycle=parseFloat(document.getElementById('sim-cycle').value)||0;
  const notes=document.getElementById('sim-notes').value.trim()||preset.notes||'뿯ν뿯½뿯½';
  const base=calcEV().base;
  const before=Math.round(base);
  const after=Math.round(before * (1 + conv/100) * urgency);
  const avgCycle=calcAverageCycle();
  const newCycle=Math.max(1, avgCycle + cycle);
  const risk=Math.min(100, calculateRiskIndex() + (conv>15?5:0) + (cycle<0?-3:0));
  const recommendation=scenarioKey==='custom'?'ASSESS':preset.recommendation;
  const confidence=preset.confidence||70;
  const output=`SCENARIO: ${preset.label}\nASSUMPTION CHANGES:\n뿯ν뿯½뿯½ Urgency modifier ${urgency.toFixed(2)}\n뿯ν뿯½뿯½ Conversion rate ╬뿯½ ${conv}%\n뿯ν뿯½뿯½ Cycle time ╬뿯½ ${cycle}d\nMODELED IMPACT:\n뿯ν뿯½뿯½ EV ${fmtCurrency(before)} 뿯ν뿯½뿯½ ${fmtCurrency(after)}\n뿯ν뿯½뿯½ Conversion delta ${conv}%\n뿯ν뿯½뿯½ Cycle time ${Math.round(avgCycle)}d 뿯ν뿯½뿯½ ${Math.round(newCycle)}d\n뿯ν뿯½뿯½ Risk index 뿯ν뿯½뿯½ ${risk}\nRECOMMENDATION: ${recommendation}\nCONFIDENCE: ${confidence}%\nAGENT NOTES: ${notes}`;
  document.getElementById('sim-output').textContent=output;
  log('SIMULATION RUN',preset.label);
  toast('Simulation generated');
}
function calcAverageCycle(){
  const active=state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  if(!active.length) return 30;
  return active.reduce((sum,l)=>sum+(l.daysToClose||30),0)/active.length;
}
function fmtCurrency(n){return '$'+fmtNum(n||0);}

function maybeAutoBrief(){
  if(sessionStorage.getItem('claw_auth')==='1' && !sessionStorage.getItem('claw_brief_seen')){
    openStrategicBrief();
    sessionStorage.setItem('claw_brief_seen','1');
  }
}
function openStrategicBrief(){
  document.getElementById('strategic-brief-body').innerHTML=buildStrategicBrief();
  openModal('modal-strategic');
}
function buildStrategicBrief(){
  const now=new Date();
  const active=state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const hot=active.filter(l=>calcScore(l)>=70).length;
  const warm=active.filter(l=>calcScore(l)>=50 && calcScore(l)<70).length;
  const cool=active.length-hot-warm;
  const ev=calcEV();
  const decayAlerts=active.filter(l=>decayDays(l)>3).length;
  const risk=calculateRiskIndex();
  const conflicts=state.conflicts.filter(c=>c.status==='pending');
  const priorityStack=[...active].sort((a,b)=>priorityScore(b)-priorityScore(a)).slice(0,5);
  return `
    <div class="dossier">
      <h4>Situation</h4>
      <p>${now.toLocaleString('en-US',{timeZone:'America/New_York'})} EST ┬╖ Mode: ${state.autonomyMode} ┬╖ Principal: Roman Lepekha</p>
      <h4>Active Pipeline</h4>
      <p>Total Leads: ${active.length} (Hot ${hot} / Warm ${warm} / Cool ${cool})<br>
      Pipeline EV 뿯ν뿯½뿯½ Base: ${fmtCurrency(Math.round(ev.base))} ┬╖ Upside: ${fmtCurrency(Math.round(ev.upside))}</p>
      <h4>Risk Picture</h4>
      <p>Risk Index: ${risk}/100 ┬╖ Decay alerts: ${decayAlerts} ┬╖ Pending conflicts: ${conflicts.length}</p>
      <h4>Priority Actions</h4>
      <p>${priorityStack.map(l=>`뿯ν뿯½뿯½ ${l.name} (${l.status}) 뿯ν뿯½뿯½ ${priorityBadge(l)} ┬╖ NBA: ${getNBAStack(l).primary}`).join('<br>')||'No active leads.'}</p>
      <h4>Agent Conflict Flags</h4>
      <p>${conflicts.length?conflicts.map(c=>`뿯ν뿯½뿯½ ${c.deal}: ${c.agentA} vs ${c.agentB}`).join('<br>'):'None pending.'}</p>
      <h4>Revenue Snapshot</h4>
      <p>Conservative: ${fmtCurrency(Math.round(ev.conservative))}<br>
      Base: ${fmtCurrency(Math.round(ev.base))}<br>
      Upside: ${fmtCurrency(Math.round(ev.upside))}</p>
    </div>`;
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// MODALS
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}

function openAddLead(){
  document.getElementById('lead-modal-title').textContent='New Lead';
  document.getElementById('lead-id').value='';
  ['lead-name','lead-org','lead-email','lead-notes','nba-primary','nba-fallback','nba-escalation'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('lead-value').value='';
  ['score-engagement','score-speed','score-fit'].forEach(id=>document.getElementById(id).value='5');
  document.getElementById('lead-status').value='Qualified';
  document.getElementById('lead-psych').value='Unknown';
  document.getElementById('lead-hold').checked=false;
  document.getElementById('lead-contact-approved').checked=false;
  document.getElementById('lead-urgency').value='2';
  document.getElementById('lead-days').value='30';
  openModal('modal-lead');
}
function openEditLead(id){
  const l=state.leads.find(x=>x.id===id);if(!l)return;
  document.getElementById('lead-modal-title').textContent='Edit Lead';
  document.getElementById('lead-id').value=l.id;
  document.getElementById('lead-name').value=l.name;
  document.getElementById('lead-org').value=l.org;
  document.getElementById('lead-email').value=l.email||'';
  document.getElementById('lead-notes').value=l.notes||'';
  document.getElementById('lead-status').value=l.status;
  document.getElementById('lead-vertical').value=l.vertical;
  document.getElementById('lead-value').value=l.value||'';
  document.getElementById('score-engagement').value=l.scoreEngagement||5;
  document.getElementById('score-speed').value=l.scoreSpeed||5;
  document.getElementById('score-fit').value=l.scoreFit||5;
  document.getElementById('lead-psych').value=l.psychProfile||'Unknown';
  document.getElementById('lead-hold').checked=!!l.manualHold;
  document.getElementById('lead-contact-approved').checked=!!l.contactApproved;
  document.getElementById('lead-urgency').value=l.urgency||2;
  document.getElementById('lead-days').value=l.daysToClose||30;
  document.getElementById('nba-primary').value=l.nbaPrimary||'';
  document.getElementById('nba-fallback').value=l.nbaFallback||'';
  document.getElementById('nba-escalation').value=l.nbaEscalation||'';
  openModal('modal-lead');
}
function saveLead(){
  const id=document.getElementById('lead-id').value;
  const data={
    name:document.getElementById('lead-name').value.trim(),
    org:document.getElementById('lead-org').value.trim(),
    vertical:document.getElementById('lead-vertical').value,
    email:document.getElementById('lead-email').value.trim(),
    status:document.getElementById('lead-status').value,
    notes:document.getElementById('lead-notes').value.trim(),
    value:parseFloat(document.getElementById('lead-value').value)||0,
    scoreEngagement:parseFloat(document.getElementById('score-engagement').value)||5,
    scoreSpeed:parseFloat(document.getElementById('score-speed').value)||5,
    scoreFit:parseFloat(document.getElementById('score-fit').value)||5,
    psychProfile:document.getElementById('lead-psych').value,
    manualHold:document.getElementById('lead-hold').checked,
    contactApproved:document.getElementById('lead-contact-approved').checked,
    urgency:parseInt(document.getElementById('lead-urgency').value,10)||2,
    daysToClose:parseInt(document.getElementById('lead-days').value,10)||30,
    nbaPrimary:document.getElementById('nba-primary').value.trim(),
    nbaFallback:document.getElementById('nba-fallback').value.trim(),
    nbaEscalation:document.getElementById('nba-escalation').value.trim(),
    lastTouch:new Date().toISOString()
  };
  if(!data.name||!data.org){alert('Name and Organization required.');return;}
  if(data.urgency<1||data.urgency>3) data.urgency=2;
  if(data.daysToClose<1) data.daysToClose=30;
  if(id){Object.assign(state.leads.find(l=>l.id===id),data);log(`UPDATED: ${data.name}`);}
  else{
    const newLead = {id:uid(),...data};
    // Tag agent-discovered leads
    if(window._importingDiscoveryId) {
      newLead.discoveredBy = 'AGENT';
      state.discoveryQueue = state.discoveryQueue.filter(x=>x.id!==window._importingDiscoveryId);
      window._importingDiscoveryId = null;
    }
    state.leads.push(newLead);
    log(`LEAD ADDED: ${data.name}`,data.org);
  }
  saveState();closeModal('modal-lead');renderAll();
}

function openDossier(leadId){
  const l=state.leads.find(x=>x.id===leadId);if(!l)return;
  const score=calcScore(l);
  const nba=getNBAStack(l);
  const ev=getLeadEV(l);
  const tone=getPsychTone(l.psychProfile);
  document.getElementById('dossier-body').innerHTML=`
    <div class="dossier">
      <h4>Contact Intelligence</h4>
      <p><strong>${l.name}</strong> ┬╖ ${l.org}${l.manualHold?' ┬╖ <span class="hold-badge">Manual Hold</span>':''}<br>${l.email||'No email on file'}<br>Vertical: ${l.vertical}</p>
      <h4>Lead Score Analysis</h4>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        ${scoreBadge(score)}
        <div style="flex:1;background:var(--border);height:8px;border-radius:4px;overflow:hidden"><div style="width:${score}%;height:100%;background:${scoreColor(score)}"></div></div>
      </div>
      <div class="score-breakdown">
        <div class="score-row"><div class="score-row-label">Engagement</div><div class="score-row-val">${l.scoreEngagement||5}/10</div></div>
        <div class="score-row"><div class="score-row-label">Response Speed</div><div class="score-row-val">${l.scoreSpeed||5}/10</div></div>
        <div class="score-row"><div class="score-row-label">Strategic Fit</div><div class="score-row-val">${l.scoreFit||5}/10</div></div>
        <div class="score-row"><div class="score-row-label">Decay Status</div><div class="score-row-val">${decayLabel(l)}</div></div>
      </div>
      <h4>Revenue Projection</h4>
      <p>EV = Score% ├뿯½ Deal Value ├뿯½ Stage Mult<br>
      = ${(score)}% ├뿯½ ${l.value?'$'+fmtNum(l.value):'뿯ν뿯½뿯½'} ├뿯½ ${(STAGE_MULT[l.status]||0.3)}<br>
      Expected Value: <strong style="color:var(--accent)">${l.value?'$'+fmtNum(ev):'뿯ν뿯½뿯½'}</strong></p>
      <h4>Priority & NBA Stack</h4>
      <p>${priorityBadge(l)} ┬╖ <strong>${priorityScore(l)} pts</strong> (Urgency ${l.urgency}/3 ┬╖ ${l.daysToClose}d target)<br>
      Primary: ${nba.primary}<br>
      Fallback: ${nba.fallback}<br>
      Escalation: ${nba.escalation}</p>
      <h4>Psychological Profile & Tone</h4>
      <p><strong>${l.psychProfile}</strong><br>${tone}</p>
      <h4>Intel / Pain Points</h4>
      <p>${l.notes||'No notes recorded.'}</p>
      <h4>Recommended Approach</h4>
      <p>${getApproach(l)}</p>
      <h4>Trestleboard Talking Points</h4>
      <p>뿯ν뿯½뿯½ 99.7% faster narrative production than traditional contractors<br>
      뿯ν뿯½뿯½ 200+ controlled variants per brief 뿯ν뿯½뿯½ platform/audience-specific<br>
      뿯ν뿯½뿯½ Sub-1% semantic drift with full source traceability<br>
      뿯ν뿯½뿯½ Human approval gates at every stage 뿯ν뿯½뿯½ IG + oversight ready<br>
      뿯ν뿯½뿯½ API-first architecture 뿯ν뿯½뿯½ zero rip-and-replace required<br>
      뿯ν뿯½뿯½ Principal-level access 뿯ν뿯½뿯½ Roman available for escalation</p>
      <h4>Pre-emptive Objection Counter</h4>
      <p>${getObjCounter(l)}</p>
      <h4>Next Action</h4>
      <p style="color:var(--accent)">${getNextAction(l)}</p>
      <h4>Contact Lock</h4>
      ${l.contactApproved
        ? `<div class="contact-lock-banner approved">뿯ν뿯½뿯½ CONTACT APPROVED 뿯ν뿯½뿯½ Outreach authorized by Roman <button class="btn sm danger" style="margin-left:auto" onclick="revokeContactApproval('${l.id}')">Revoke Approval</button></div>`
        : `<div class="contact-lock-banner locked">≡뿯ƽ뿯½뿯½ OUTREACH LOCKED 뿯ν뿯½뿯½ Awaiting Roman's approval <button class="btn sm success" style="margin-left:auto" onclick="initiateContactApproval('${l.id}')">뿯ν뿯½뿯½ Approve Contact</button></div>`
      }
      <div style="margin-top:16px;font-size:9px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px">CLAWBOT v2.1 // TRESTLEBOARD GROUP LLC // INTERNAL // ${new Date().toLocaleString()}</div>
    </div>`;
  openModal('modal-dossier');
}
function getApproach(l){
  const m={
    'Federal DoD':'Lead with operational speed and IG audit compliance. Reference NDAA requirements, contested information environment doctrine, and 99.7% faster delivery vs. traditional PAO contractors.',
    'IC / Special Programs':'Emphasize zero-silo architecture and API-first integration with existing intelligence workflows. Classified program briefing available upon request.',
    'SOCOM':'Position as psychological operations and information warfare accelerator. Speed + governance = operational advantage in contested environments.',
    'Federal Civilian':'Focus on governance layer and FedRAMP alignment pathway. Reference FISMA compliance posture and zero-silo integration.',
    'Municipal Gov':'Emphasize constituent communication speed and crisis response capability. Reference recent municipal communications failures in comparable cities.',
    'Defense Contractor':'Teaming and subcontracting value-add for existing PAO and comms contracts. Force multiplier framing.',
    'Law Firm / Patent':'Lead with patent pipeline governance and attorney review gates. Full audit trail = malpractice risk reduction.',
    'Congressional':'Constituent communication at scale with rapid message adaptation for crisis response and campaign environments.'
  };
  return m[l.vertical]||'Customize approach based on specific organizational context and procurement readiness.';
}
function getObjCounter(l){
  const top=state.objections.filter(o=>o.vertical===l.vertical||o.vertical==='All').slice(0,2);
  if(!top.length)return'No objection patterns logged for this vertical yet. Log patterns as you encounter them.';
  return top.map(o=>`<strong style="color:var(--warn)">"${o.type}"</strong> 뿯ν뿯½뿯½ ${o.counter||'Counter not recorded'}`).join('<br><br>');
}
function getNextAction(l){
  const m={Qualified:'Send first-touch outreach. Reference a specific pain point or recent public statement.',Briefing:'Follow up within 48h. Prepare tailored capability deck.',Proposal:'Schedule 30-min discovery call. Offer technical demo.',Negotiation:'Follow up in 5 business days. Address outstanding objections directly.',Verbal:'Prepare contract terms. Coordinate with legal.',Closed:'Initiate onboarding. Schedule kickoff call.'};
  return m[l.status]||'Assess current stage and determine appropriate engagement approach.';
}

function openNewCampaign(){openModal('modal-campaign');}
function triggerCampaign(){
  const name=document.getElementById('camp-name').value.trim();
  if(!name){alert('Campaign name required.');return;}
  state.campaigns.push({id:uid(),name,vertical:document.getElementById('camp-vertical').value,type:document.getElementById('camp-type').value,brief:document.getElementById('camp-brief').value.trim(),created:new Date().toISOString(),status:'Active',steps:[{day:'D1',label:'First Touch',done:false},{day:'D4',label:'Follow-Up',done:false},{day:'D10',label:'Final Push',done:false}]});
  log(`CAMPAIGN LAUNCHED: ${name}`);
  saveState();closeModal('modal-campaign');
  document.getElementById('camp-name').value='';document.getElementById('camp-brief').value='';
  renderAll();toast('Campaign launched');
}

function openNewBrief(){openModal('modal-brief');}
function submitBrief(){
  const title=document.getElementById('brief-title').value.trim();
  const body=document.getElementById('brief-body').value.trim();
  if(!title||!body){alert('Title and brief required.');return;}
  const channels=['telegram','whatsapp','discord','email','web'].filter(c=>document.getElementById('ch-'+c)?.checked).map(c=>c.charAt(0).toUpperCase()+c.slice(1));
  state.content.push({id:uid(),title,type:document.getElementById('brief-type').value,priority:document.getElementById('brief-priority').value,body,channels,status:'Pending',created:new Date().toISOString()});
  log(`BRIEF SUBMITTED: ${title}`,channels.join(', '));
  saveState();closeModal('modal-brief');
  document.getElementById('brief-title').value='';document.getElementById('brief-body').value='';
  renderAll();toast('Brief submitted for review');
}

function openScheduleMeeting(){
  const sel=document.getElementById('meeting-lead');
  sel.innerHTML=state.leads.filter(l=>l.status!=='Archived').map(l=>`<option value="${l.id}">${l.name} 뿯ν뿯½뿯½ ${l.org}</option>`).join('');
  if(!sel.innerHTML){alert('Add a lead first.');return;}
  openModal('modal-meeting');
}
function saveMeeting(){
  const leadId=document.getElementById('meeting-lead').value;
  const l=state.leads.find(x=>x.id===leadId);
  if(l){l.status='Briefing';l.lastTouch=new Date().toISOString();}
  state.meetings.push({id:uid(),leadId,datetime:document.getElementById('meeting-datetime').value,format:document.getElementById('meeting-format').value,notes:document.getElementById('meeting-notes').value.trim(),outcome:null,created:new Date().toISOString()});
  log(`BRIEFING SCHEDULED: ${l?.name||leadId}`);
  saveState();closeModal('modal-meeting');
  document.getElementById('meeting-notes').value='';
  renderAll();toast('Briefing scheduled');
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// INTELLIGENCE SCAN
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function runIntelligenceScan(){
  const stale=state.leads.filter(l=>!['Closed','Archived'].includes(l.status)&&decayDays(l)>3);
  const noValue=state.leads.filter(l=>!l.value&&!['Closed','Archived'].includes(l.status));
  let msg=`INTELLIGENCE SCAN 뿯ν뿯½뿯½ ${new Date().toLocaleString()}\n\n`;
  msg+=`Active leads: ${state.leads.filter(l=>!['Closed','Archived'].includes(l.status)).length}\n`;
  msg+=`Decay alerts: ${stale.length} leads stale 72h+\n`;
  msg+=`Missing deal value: ${noValue.length} leads\n`;
  msg+=`Pipeline EV: $${fmtNum(calcEV().base)} (base case)\n`;
  msg+=`Campaigns running: ${state.campaigns.filter(c=>c.status==='Active').length}\n`;
  msg+=`Content pending review: ${state.content.filter(c=>c.status==='Pending').length}`;
  alert(msg);
  log('INTELLIGENCE SCAN','Manual scan executed');
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// CONTACT LOCK SYSTEM
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
let _pendingApprovalLeadId = null;
function initiateContactApproval(leadId) {
  const l = state.leads.find(x=>x.id===leadId);
  if(!l) return;
  _pendingApprovalLeadId = leadId;
  document.getElementById('contact-approve-text').innerHTML =
    `You are approving outreach for <strong>${l.name}</strong> at <strong>${l.org}</strong>.<br><br>This authorizes CLAWBOT to execute campaign sequences. Confirm?`;
  closeModal('modal-dossier');
  openModal('modal-contact-approve');
}
function confirmContactApproval() {
  if(!_pendingApprovalLeadId) return;
  const l = state.leads.find(x=>x.id===_pendingApprovalLeadId);
  if(!l) { _pendingApprovalLeadId=null; return; }
  l.contactApproved = true;
  state.auditLog.unshift({ time:new Date().toISOString(), actor:'ROMAN', action:`CONTACT APPROVED: ${l.name}`, detail:`Outreach authorized for ${l.org}` });
  if(state.auditLog.length>500) state.auditLog=state.auditLog.slice(0,500);
  saveState();
  closeModal('modal-contact-approve');
  _pendingApprovalLeadId = null;
  renderAll();
  toast(`Contact approved: ${l.name}`);
}
function revokeContactApproval(leadId) {
  const l = state.leads.find(x=>x.id===leadId);
  if(!l) return;
  if(!confirm(`Revoke outreach approval for ${l.name}?`)) return;
  l.contactApproved = false;
  state.auditLog.unshift({ time:new Date().toISOString(), actor:'ROMAN', action:`CONTACT REVOKED: ${l.name}`, detail:`Outreach authorization revoked for ${l.org}` });
  if(state.auditLog.length>500) state.auditLog=state.auditLog.slice(0,500);
  saveState();
  closeModal('modal-dossier');
  renderAll();
  toast(`Approval revoked: ${l.name}`);
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// AGENT DISCOVERY ENGINE
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function setDiscoveryMode(mode) {
  state.discoveryMode = mode;
  saveState();
  renderDiscovery();
  updateDiscoveryNavIndicator();
  log('DISCOVERY MODE', mode);
  toast(`Discovery: ${mode}`);
}
function updateDiscoveryNavIndicator() {
  const ind = document.getElementById('nav-discovery-indicator');
  if(!ind) return;
  if(state.discoveryMode==='SEARCHING') { ind.style.color='var(--success)'; ind.textContent='뿯ν뿯½뿯½'; }
  else if(state.discoveryMode==='PAUSED') { ind.style.color='var(--warn)'; ind.textContent='뿯ν뿯½뿯½'; }
  else { ind.style.color='var(--muted)'; ind.textContent='뿯ν뿯½뿯½'; }
}
function renderDiscovery() {
  updateDiscoveryNavIndicator();
  // Sync webhook input
  const wh = document.getElementById('disc-webhook-input');
  if(wh && document.activeElement!==wh) wh.value = state.discoveryWebhook||'';
  // Mode buttons
  ['OFF','SEARCHING','PAUSED'].forEach(m=>{
    const btn = document.getElementById('disc-btn-'+m);
    if(btn) {
      btn.className = 'disc-mode-btn' + (state.discoveryMode===m ? ' active-'+m : '');
    }
  });
  // Queue table
  const tbody = document.getElementById('discovery-queue-tbody');
  if(tbody) {
    if(!state.discoveryQueue.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:24px;font-size:11px">No leads in discovery queue. Run a scan or add leads manually.</td></tr>`;
    } else {
      tbody.innerHTML = state.discoveryQueue.map(item=>`
        <tr>
          <td style="font-size:10px;color:var(--muted)">${item.source||'뿯ν뿯½뿯½'}</td>
          <td>${item.name||'뿯ν뿯½뿯½'}</td>
          <td>${item.org||'뿯ν뿯½뿯½'}</td>
          <td><span class="tag amber">${item.vertical||'Unknown'}</span></td>
          <td><span style="color:${item.confidence>=70?'var(--success)':item.confidence>=50?'var(--warn)':'var(--muted)'};font-weight:bold">${item.confidence||'?'}%</span></td>
          <td style="font-size:10px;color:#aaa;max-width:220px">${item.intel||'뿯ν뿯½뿯½'}</td>
          <td><div style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="btn sm success" onclick="importDiscoveryLead('${item.id}')">Import</button>
            <button class="btn sm danger" onclick="dismissDiscoveryLead('${item.id}')">Dismiss</button>
          </div></td>
        </tr>`).join('');
    }
  }
  // Discovery log
  const logEl = document.getElementById('disc-log-list');
  if(logEl) {
    if(!state.discoveryLog.length) {
      logEl.innerHTML = '<div class="disc-log-entry"><span class="disc-log-msg" style="color:var(--muted)">No discovery scans run yet.</span></div>';
    } else {
      logEl.innerHTML = state.discoveryLog.slice(0,50).map(e=>`
        <div class="disc-log-entry">
          <span class="disc-log-time">${new Date(e.time).toLocaleString()}</span>
          <span class="disc-log-msg">${e.query} 뿯ν뿯½뿯½ ${e.results}</span>
        </div>`).join('');
    }
  }
}
function runDiscoveryScan() {
  const webhook = state.discoveryWebhook?.trim();
  const timestamp = new Date().toISOString();
  const query = `Trestleboard discovery scan 뿯ν뿯½뿯½ ${new Date().toLocaleString()}`;
  const logEntry = { time: timestamp, query, results: webhook ? 'POST dispatched to webhook' : 'No webhook configured 뿯ν뿯½뿯½ scan simulated' };
  if(webhook) {
    fetch(webhook, { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ scan:'discovery', timestamp, pipeline_ev: calcEV().base, active_leads: state.leads.filter(l=>!['Closed','Archived'].includes(l.status)).length })
    }).then(()=>{ logEntry.results='POST delivered successfully'; saveState(); renderDiscovery(); toast('Discovery scan dispatched'); })
      .catch(err=>{ logEntry.results=`POST failed: ${err.message}`; saveState(); renderDiscovery(); toast('Webhook error 뿯ν뿯½뿯½ check log'); });
  }
  state.discoveryLog.unshift(logEntry);
  if(state.discoveryLog.length>100) state.discoveryLog=state.discoveryLog.slice(0,100);
  log('DISCOVERY SCAN', webhook?'Webhook fired':'Simulated');
  saveState();
  renderDiscovery();
  if(!webhook) toast('Scan simulated 뿯ν뿯½뿯½ configure webhook in Discovery settings');
}
function importDiscoveryLead(itemId) {
  const item = state.discoveryQueue.find(x=>x.id===itemId);
  if(!item) return;
  // Pre-fill the add lead modal with discovery data
  document.getElementById('lead-modal-title').textContent = 'Import Discovered Lead';
  document.getElementById('lead-id').value = '';
  document.getElementById('lead-name').value = item.name||'';
  document.getElementById('lead-org').value = item.org||'';
  document.getElementById('lead-notes').value = item.intel||'';
  document.getElementById('lead-email').value = '';
  document.getElementById('lead-value').value = '';
  ['score-engagement','score-speed','score-fit'].forEach(id=>document.getElementById(id).value='5');
  document.getElementById('lead-status').value = 'Qualified';
  document.getElementById('lead-psych').value = 'Unknown';
  document.getElementById('lead-hold').checked = false;
  document.getElementById('lead-contact-approved').checked = false;
  document.getElementById('lead-urgency').value = '2';
  document.getElementById('lead-days').value = '30';
  ['nba-primary','nba-fallback','nba-escalation'].forEach(id=>document.getElementById(id).value='');
  // Try to match vertical
  const vertSel = document.getElementById('lead-vertical');
  const options = Array.from(vertSel.options).map(o=>o.value);
  const match = options.find(v=>v.toLowerCase().includes((item.vertical||'').toLowerCase()));
  if(match) vertSel.value = match;
  // Store the discovery item id to tag the lead after save
  window._importingDiscoveryId = itemId;
  openModal('modal-lead');
  log('DISCOVERY IMPORT', `Importing ${item.name} from ${item.source}`);
}
function dismissDiscoveryLead(itemId) {
  state.discoveryQueue = state.discoveryQueue.filter(x=>x.id!==itemId);
  log('DISCOVERY DISMISS', itemId);
  saveState();
  renderDiscovery();
  toast('Lead dismissed from discovery queue');
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// ANALYTICS / CHARTS
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
const chartInstances = {};
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function destroyChart(key) {
  if(chartInstances[key]) { chartInstances[key].destroy(); delete chartInstances[key]; }
}
function renderAnalytics() {
  renderPipelineFunnelChart();
  renderScoreDistChart();
  renderDecayPieChart();
  renderEVCompositionChart();
  renderPriorityMatrixChart();
}
function renderPipelineFunnelChart() {
  destroyChart('funnel');
  const canvas = document.getElementById('chart-funnel');
  if(!canvas) return;
  const accent = getCSSVar('--accent');
  const muted = getCSSVar('--muted');
  const counts = STAGES.map(s=>state.leads.filter(l=>l.status===s).length);
  const evs = STAGES.map(s=>state.leads.filter(l=>l.status===s).reduce((sum,l)=>sum+getLeadEV(l),0));
  const ctx = canvas.getContext('2d');
  chartInstances['funnel'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: STAGES,
      datasets: [
        { label:'Leads', data:counts, backgroundColor: accent+'99', borderColor: accent, borderWidth:1, yAxisID:'y' },
        { label:'EV ($)', data:evs, backgroundColor: '#2a9a4a88', borderColor:'#2a9a4a', borderWidth:1, type:'bar', yAxisID:'y1' }
      ]
    },
    options: {
      indexAxis:'y', responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{ labels:{ color:muted, font:{family:'Courier New',size:10} } } },
      scales:{
        x:{ ticks:{color:muted}, grid:{color:getCSSVar('--border')+'44'} },
        y:{ ticks:{color:accent, font:{size:10}}, grid:{color:getCSSVar('--border')+'44'} },
        y1:{ position:'right', ticks:{color:'#2a9a4a', callback:v=>'$'+fmtNum(v)}, grid:{display:false} }
      }
    }
  });
}
function renderScoreDistChart() {
  destroyChart('scoredist');
  const canvas = document.getElementById('chart-score-dist');
  if(!canvas) return;
  const buckets = {'0-30':0,'31-50':0,'51-70':0,'71-100':0};
  state.leads.forEach(l=>{
    const s=calcScore(l);
    if(s<=30) buckets['0-30']++;
    else if(s<=50) buckets['31-50']++;
    else if(s<=70) buckets['51-70']++;
    else buckets['71-100']++;
  });
  const accent=getCSSVar('--accent'); const muted=getCSSVar('--muted');
  const ctx=canvas.getContext('2d');
  chartInstances['scoredist'] = new Chart(ctx, {
    type:'bar',
    data:{
      labels:Object.keys(buckets),
      datasets:[{label:'Leads by Score',data:Object.values(buckets),backgroundColor:[getCSSVar('--muted')+'99',getCSSVar('--success')+'88','#cc772288',getCSSVar('--danger')+'88'],borderColor:[muted,'#2a9a4a','#cc7722',getCSSVar('--danger')],borderWidth:1}]
    },
    options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{labels:{color:muted,font:{family:'Courier New',size:10}}}},scales:{x:{ticks:{color:muted},grid:{color:getCSSVar('--border')+'44'}},y:{ticks:{color:muted,stepSize:1},grid:{color:getCSSVar('--border')+'44'}}}}
  });
}
function renderDecayPieChart() {
  destroyChart('decaypie');
  const canvas = document.getElementById('chart-decay-pie');
  if(!canvas) return;
  const active=state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const fresh=active.filter(l=>decayDays(l)<=1).length;
  const warning=active.filter(l=>decayDays(l)>1&&decayDays(l)<=3).length;
  const critical=active.filter(l=>decayDays(l)>3).length;
  const muted=getCSSVar('--muted');
  const ctx=canvas.getContext('2d');
  chartInstances['decaypie'] = new Chart(ctx, {
    type:'doughnut',
    data:{labels:['Fresh','Warning','Critical'],datasets:[{data:[fresh,warning,critical],backgroundColor:['#2a9a4a99','#cc772299','#cc333399'],borderColor:['#2a9a4a','#cc7722','#cc3333'],borderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{position:'bottom',labels:{color:muted,font:{family:'Courier New',size:10}}}}}
  });
}
function renderEVCompositionChart() {
  destroyChart('evcomp');
  const canvas = document.getElementById('chart-ev-composition');
  if(!canvas) return;
  const muted=getCSSVar('--muted'); const accent=getCSSVar('--accent');
  const stageEVs=STAGES.map(s=>state.leads.filter(l=>l.status===s).reduce((sum,l)=>sum+(calcScore(l)/100)*(l.value||0)*(STAGE_MULT[s]||0.3),0));
  const ctx=canvas.getContext('2d');
  chartInstances['evcomp'] = new Chart(ctx, {
    type:'bar',
    data:{
      labels:STAGES,
      datasets:[
        {label:'Conservative',data:stageEVs.map(v=>v*0.7),backgroundColor:muted+'88',borderColor:muted,borderWidth:1,stack:'ev'},
        {label:'Base',data:stageEVs.map(v=>v*0.3),backgroundColor:accent+'88',borderColor:accent,borderWidth:1,stack:'ev'},
        {label:'Upside',data:stageEVs.map(v=>v*0.3),backgroundColor:'#2a9a4a88',borderColor:'#2a9a4a',borderWidth:1,stack:'ev'}
      ]
    },
    options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{labels:{color:muted,font:{family:'Courier New',size:10}}}},scales:{x:{ticks:{color:muted},grid:{color:getCSSVar('--border')+'44'},stacked:true},y:{ticks:{color:muted,callback:v=>'$'+fmtNum(v)},grid:{color:getCSSVar('--border')+'44'},stacked:true}}}
  });
}
function renderPriorityMatrixChart() {
  destroyChart('pmatrix');
  const canvas = document.getElementById('chart-priority-matrix');
  if(!canvas) return;
  const active=state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const accent=getCSSVar('--accent'); const muted=getCSSVar('--muted');
  const data=active.map(l=>({x:l.daysToClose||30, y:Math.round(getLeadEV(l)), r:Math.max(4,Math.round(calcScore(l)/10)), label:l.name}));
  const ctx=canvas.getContext('2d');
  chartInstances['pmatrix'] = new Chart(ctx, {
    type:'bubble',
    data:{datasets:[{label:'Leads',data,backgroundColor:accent+'88',borderColor:accent,borderWidth:1}]},
    options:{
      responsive:true,maintainAspectRatio:true,
      plugins:{
        legend:{labels:{color:muted,font:{family:'Courier New',size:10}}},
        tooltip:{callbacks:{label:d=>`${d.raw.label} 뿯ν뿯½뿯½ ${d.raw.x}d / $${fmtNum(d.raw.y)} EV / Score ${d.raw.r*10}`}}
      },
      scales:{
        x:{title:{display:true,text:'Days to Close',color:muted,font:{family:'Courier New',size:10}},ticks:{color:muted},grid:{color:getCSSVar('--border')+'44'}},
        y:{title:{display:true,text:'Expected Value ($)',color:muted,font:{family:'Courier New',size:10}},ticks:{color:muted,callback:v=>'$'+fmtNum(v)},grid:{color:getCSSVar('--border')+'44'}}
      }
    }
  });
}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// UTILS
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function uid(){return Math.random().toString(36).substr(2,9)+Date.now().toString(36);}
function fmtNum(n){if(!n)return'0';if(n>=1000000)return(n/1000000).toFixed(1)+'M';if(n>=1000)return(n/1000).toFixed(0)+'K';return Math.round(n).toLocaleString();}
function toast(msg){const t=document.getElementById('toast');t.textContent='뿯ν뿯½╕ '+msg.toUpperCase();t.style.display='block';setTimeout(()=>t.style.display='none',3000);}
function dl(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();}
function exportLeads(){const csv=['Name,Org,Vertical,Email,Status,Score,DealValue,LastTouch,Notes',...state.leads.map(l=>`"${l.name}","${l.org}","${l.vertical}","${l.email||''}","${l.status}","${calcScore(l)}","${l.value||''}","${l.lastTouch||''}","${l.notes||''}"`)].join('\n');dl('clawbot-leads.csv',csv,'text/csv');log('EXPORTED: Leads CSV');}
function exportLog(){const csv=['Time,Actor,Action,Detail',...state.auditLog.map(e=>`"${e.time}","${e.actor}","${e.action}","${e.detail||''}"`)].join('\n');dl('clawbot-audit.csv',csv,'text/csv');}
function clearLog(){if(confirm('Clear all audit log entries?')){state.auditLog=[];saveState();renderAll();}}

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// CLOCK
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
function updateClock(){const el=document.getElementById('current-time');if(el)el.textContent=new Date().toLocaleString('en-US',{timeZone:'America/New_York',hour12:false,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'})+' EST';}
setInterval(updateClock,1000);updateClock();

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// INIT
// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));
initAuth();
loadState();
renderAll();


// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½ PATCH renderCommand for new layout 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
const __origRC = renderCommand;
renderCommand = function() {
  __origRC();
  // Re-wire metrics to new tiles
  const active = state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const staleCount = active.filter(l=>decayDays(l)>3).length;
  const decayCount = active.filter(l=>decayDays(l)>1).length;
  const ev = calcEV();
  const evEl = document.getElementById('tm-pipeline');
  if(evEl) evEl.textContent = '$'+fmtNum(Math.round(ev.base));
  const activeEl = document.getElementById('cmd-active');
  if(activeEl) activeEl.textContent = active.length;
  const decayEl2 = document.getElementById('cmd-decay');
  if(decayEl2) decayEl2.textContent = decayCount;
  const staleEl = document.getElementById('cmd-stale');
  if(staleEl) staleEl.textContent = staleCount;
  renderCommandCharts();
};

// Patch renderAll to call new renderCommand after
const __origRA = renderAll;
renderAll = function() {
  __origRA();
  renderCommandCharts();
  updateConflictBadge();
};

// 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½ AGENT DISCOVERY INTEL IMPORT 뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½뿯ν뿯½뿯½
// Injects pre-researched leads into the discovery queue.
// Source: USAspending.gov DoD contract database + public records
const AGENT_INTEL_LEADS = [{"id":"disc_001","source":"USAspending.gov 뿯ν뿯½뿯½ DoD Contract Recompete","name":"Business Development Director","org":"LMI Consulting, LLC","vertical":"Defense Contractor","confidence":92,"intel":"CRITICAL RECOMPETE: $83.4M WHS/OSD Strategic Communications & Admin Support contract EXPIRED July 2025. Active recompete window open NOW. LMI is the incumbent 뿯ν뿯½뿯½ they will be scrambling to rebuild and partner. Angle: Trestleboard as narrative/AI content subcontractor on recompete bid. Contact BD or Capture team.","linkedinSearch":"site:linkedin.com LMI Consulting strategic communications director","email":"bd@lmi.org (format 뿯ν뿯½뿯½ verify)","contractRef":"WHS $83.4M expired 2025-07-22","approach":"TEAMING 뿯ν뿯½뿯½ Position as AI-native subcontractor on their OSD recompete. Lead with 99.7% faster narrative production and IG-ready audit trail."},{"id":"disc_002","source":"USAspending.gov 뿯ν뿯½뿯½ DoD Contract Expiring","name":"VP Strategic Communications","org":"HII Mission Technologies Corp","vertical":"Defense Contractor","confidence":89,"intel":"RECOMPETE WINDOW: $48.7M USAF Info Ops / Applied Research contract EXPIRED Sept 2025. HII Mission Technologies is a top-tier DoD contractor. Angle: Team on USAF narrative/IO recompete.","linkedinSearch":"site:linkedin.com HII Mission Technologies strategic communications capture manager","email":"capture@hii.com (format 뿯ν뿯½뿯½ verify)","contractRef":"USAF $48.7M expired 2025-09-15","approach":"TEAMING 뿯ν뿯½뿯½ Strategic communications/narrative as add-on to their IO portfolio. Reference USAF contested information environment doctrine."},{"id":"disc_003","source":"USAspending.gov 뿯ν뿯½뿯½ DHA Contract Just Expired","name":"Program Director","org":"Deloitte Consulting LLP (Defense Health Agency)","vertical":"Defense Contractor","confidence":87,"intel":"HOT: $39.2M Defense Health Agency program management/comms contract EXPIRED Feb 2026. DHA is one of DoD's largest communications buyers. Contact DHA practice BD lead.","linkedinSearch":"site:linkedin.com Deloitte Defense Health Agency strategic communications director","email":"defense@deloitte.com (format 뿯ν뿯½뿯½ verify)","contractRef":"DHA $39.2M expired 2026-02-15","approach":"TEAMING 뿯ν뿯½뿯½ Offer AI narrative production as differentiator in Deloitte's DHA recompete package."},{"id":"disc_004","source":"USAspending.gov 뿯ν뿯½뿯½ USAF Contract Expiring NOW","name":"Contracts & Capture Manager","org":"CACI, Inc. - Federal","vertical":"Defense Contractor","confidence":85,"intel":"URGENT: $32.4M USAF IT/comms application support contract expires March 2026 뿯ν뿯½뿯½ in active recompete window RIGHT NOW. CACI is a major prime 뿯ν뿯½뿯½ teaming opportunity for Trestleboard's narrative/comms layer.","linkedinSearch":"site:linkedin.com CACI Federal strategic communications Air Force capture","email":"businessdev@caci.com (format 뿯ν뿯½뿯½ verify)","contractRef":"USAF $32.4M expires 2026-03-31","approach":"TEAMING 뿯ν뿯½뿯½ Pitch as rapid narrative/content subcontractor on USAF recompete. CACI already knows the space; position Trestleboard as their AI edge."},{"id":"disc_005","source":"USAspending.gov 뿯ν뿯½뿯½ DHA Contract Expiring THIS MONTH","name":"Director of Strategic Communications","org":"Chickasaw Aerospace, LLC","vertical":"Defense Contractor","confidence":88,"intel":"EXPIRING: $15.95M DHA Director/DAG Strategic Communications, Engagements, Protocol & Archives contract expires March 2026 뿯ν뿯½뿯½ THIS MONTH. 8(a) small business 뿯ν뿯½뿯½ they may be losing this contract or recompeting. Trestleboard can position as successor or teaming partner.","linkedinSearch":"site:linkedin.com Chickasaw Aerospace strategic communications","email":"info@chickasawaerospace.com (format 뿯ν뿯½뿯½ verify)","contractRef":"DHA $15.95M expires 2026-03-16","approach":"DIRECT APPROACH or TEAMING 뿯ν뿯½뿯½ This contract ends THIS MONTH. DHA will need a replacement. Pitch DHA directly or help Chickasaw on transition."},{"id":"disc_006","source":"USAspending.gov 뿯ν뿯½뿯½ DISA Contract Just Expired","name":"BD Director","org":"Command Post Technologies, Inc.","vertical":"Defense Contractor","confidence":80,"intel":"$25.8M DISA IT/comms support contract expired Feb 2026. Small business 뿯ν뿯½뿯½ may be looking for teaming partners. DISA is a heavy comms buyer.","linkedinSearch":"site:linkedin.com Command Post Technologies business development DISA","email":"info@commandposttechnologies.com (format 뿯ν뿯½뿯½ verify)","contractRef":"DISA $25.8M expired 2026-02-03","approach":"TEAMING 뿯ν뿯½뿯½ Approach as AI-native narrative partner for DISA recompete effort."},{"id":"disc_007","source":"USAspending.gov 뿯ν뿯½뿯½ Ipsos Public Affairs Active Contract","name":"Federal Practice Leader","org":"Ipsos Public Affairs, LLC","vertical":"Federal Civilian","confidence":78,"intel":"$35.2M DHA public affairs & program support contract active through Nov 2026. Ipsos does research; Trestleboard does narrative production. Complementary offering.","linkedinSearch":"site:linkedin.com Ipsos Public Affairs Defense Health federal","email":"publicaffairs@ipsos.com (format 뿯ν뿯½뿯½ verify)","contractRef":"DHA $35.2M active through 2026-11-30","approach":"PARTNERSHIP 뿯ν뿯½뿯½ Pitch as Ipsos's content execution arm for DHA contract. Research + narrative = complete offering."},{"id":"disc_008","source":"USAspending.gov 뿯ν뿯½뿯½ Navy Active Contract","name":"Program Manager","org":"Next Intelligence Solutions, LLC","vertical":"Defense Contractor","confidence":75,"intel":"$9.53M Navy administrative/comms support contract through Aug 2026. Veteran-owned small business 뿯ν뿯½뿯½ strong alignment with Trestleboard's positioning. Recompete window opens early 2026.","linkedinSearch":"site:linkedin.com Next Intelligence Solutions Navy communications","email":"info@nextintelligencesolutions.com (format 뿯ν뿯½뿯½ verify)","contractRef":"Navy $9.53M expires 2026-08-31","approach":"TEAMING 뿯ν뿯½뿯½ Small business alignment. Pitch recompete teaming with shared veteran/DoD community positioning."},{"id":"disc_009","source":"USAspending.gov 뿯ν뿯½뿯½ USAF Communications Contract","name":"Director of Communications Programs","org":"Innovative Technology Solutions JV, LLC","vertical":"Defense Contractor","confidence":77,"intel":"$9.3M USAF Professional Communications Support through June 2027. PSC code = direct comms professional services. Clean contract match to Trestleboard capability. ITS JV is a joint venture looking to grow.","linkedinSearch":"site:linkedin.com Innovative Technology Solutions Air Force communications","email":"bd@itsolvjv.com (format 뿯ν뿯½뿯½ verify)","contractRef":"USAF $9.3M expires 2027-06-02 PSC:COMMUNICATIONS","approach":"TEAMING 뿯ν뿯½뿯½ Direct PSC match. Position as AI narrative subcontractor on their USAF communications programs."},{"id":"disc_010","source":"USAspending.gov + Public Record 뿯ν뿯½뿯½ Active Buyer","name":"Director, Strategic Communications","org":"Defense Health Agency (DHA)","vertical":"Federal DoD","confidence":83,"intel":"DHA is one of the most active DoD comms buyers 뿯ν뿯½뿯½ multiple large contracts expiring 2026. Active procurement cycle NOW. Office of Communications & Public Affairs at 7700 Arlington Blvd, Falls Church VA. Multiple recompetes in play simultaneously.","linkedinSearch":"site:linkedin.com Defense Health Agency strategic communications director","email":"osd.ha.tricare-mb.mbx.dha-communications@mail.mil (public)","contractRef":"Multiple DHA comms contracts 뿯ν뿯½뿯½ active buyer cycle","approach":"DIRECT PITCH 뿯ν뿯½뿯½ DHA is buying now. Position as AI-native narrative vendor. Reference successful DHA contractor models (Ipsos, Chickasaw)."},{"id":"disc_011","source":"Public Record 뿯ν뿯½뿯½ Washington Headquarters Services","name":"Contracting Officer / Strategic Comms Director","org":"Washington Headquarters Services (WHS/OSD)","vertical":"Federal DoD","confidence":85,"intel":"WHS manages OSD/Pentagon comms contracting. The LMI $83.4M contract EXPIRED July 2025 뿯ν뿯½뿯½ WHS is actively recompeting. WHS Acquisition Directorate at the Pentagon holds the vehicle.","linkedinSearch":"site:linkedin.com Washington Headquarters Services strategic communications contracting","email":"whs.pentagon.pnc.mbx.acquisition@mail.mil (public format)","contractRef":"OSD $83.4M LMI contract expired 뿯ν뿯½뿯½ active recompete","approach":"DIRECT PITCH 뿯ν뿯½뿯½ Offer as prime or sub on WHS strategic comms recompete. Lead with OSD narrative doctrine alignment and Roman's principal-level access."},{"id":"disc_012","source":"SOCOM Public Affairs 뿯ν뿯½뿯½ socom.mil (verified)","name":"Director, USSOCOM Public Affairs","org":"US Special Operations Command (SOCOM) 뿯ν뿯½뿯½ MacDill AFB","vertical":"Federal DoD","confidence":91,"intel":"SOCOM PAO at MacDill AFB, Tampa FL 뿯ν뿯½뿯½ LOCAL TO ROMAN/SOUTH FLORIDA. Public contact: SOCOM.SOCO.Outreach.DL@socom.mil (verified). SOCOM PAO oversees SOF narrative, internal comms, and community relations. FY2026 budget cycle active. PSYOPs and IO are core SOCOM missions.","linkedinSearch":"site:linkedin.com SOCOM Public Affairs director strategic communications MacDill","email":"SOCOM.SOCO.Outreach.DL@socom.mil (VERIFIED PUBLIC)","contractRef":"SOCOM PAO 뿯ν뿯½뿯½ MacDill AFB Tampa FL 뿯ν뿯½뿯½ FY2026 active","approach":"DIRECT PITCH 뿯ν뿯½뿯½ Geographic proximity advantage (Tampa/South Florida). Lead with SOF operational speed framing, 200+ variant narrative production, sub-1% semantic drift. This is Roman's home turf."}];

function loadAgentIntel() {
  let added = 0;
  AGENT_INTEL_LEADS.forEach(lead => {
    if(!state.discoveryQueue) state.discoveryQueue = [];
    if(!state.discoveryQueue.find(x => x.id === lead.id)) {
      state.discoveryQueue.push({
        id: lead.id,
        source: lead.source,
        name: lead.name,
        org: lead.org,
        vertical: lead.vertical,
        confidence: lead.confidence,
        intel: `${lead.intel}\n\nLinkedIn: ${lead.linkedinSearch}\nEmail (verify): ${lead.email}\nContract: ${lead.contractRef}\nApproach: ${lead.approach}`,
        addedAt: new Date().toISOString()
      });
      added++;
    }
  });
  log('AGENT INTEL LOADED', `${added} leads added to discovery queue`);
  saveState();
  toast(`${added} intel leads loaded 뿯ν뿯½뿯½ review in Discovery`);
  if(typeof renderDiscovery === 'function') renderDiscovery();
}

// Apollo-verified contacts (enriched via Apollo.io API 뿯ν뿯½뿯½ verified emails)
const APOLLO_VERIFIED_LEADS = [
  {id:"apollo_001",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Matthew Fay",org:"HII Mission Technologies",vertical:"Defense Contractor",confidence:95,intel:"VP Capture Management 뿯ν뿯½뿯½ HII $48.7M USAF Info Ops contract EXPIRED Sept 2025. This is the teaming decision-maker for the recompete. Falls Church VA.\n\nApproach: TEAMING 뿯ν뿯½뿯½ USAF IO narrative recompete. Lead with AI-speed and variant depth.\nEmail (verified): mfay@alionscience.com\nLinkedIn: linkedin.com/in/matthew-fay-b31ab37",addedAt:new Date().toISOString()},
  {id:"apollo_002",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Robert Sebastianelli",org:"HII Mission Technologies",vertical:"Defense Contractor",confidence:95,intel:"Capture Director 뿯ν뿯½뿯½ HII $48.7M USAF contract expired Sept 2025. Capture Director owns the recompete BD. Chantilly VA.\n\nApproach: TEAMING 뿯ν뿯½뿯½ Direct capture lead. Pitch Trestleboard as AI narrative subcontractor for recompete.\nEmail (verified): robert.sebastianelli@hii.com\nLinkedIn: linkedin.com/in/robert-sebastianelli-4812261a",addedAt:new Date().toISOString()},
  {id:"apollo_003",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Jaime Orlando",org:"HII Mission Technologies",vertical:"Defense Contractor",confidence:90,intel:"SVP Communications 뿯ν뿯½뿯½ oversees all narrative and public affairs across HII contracts. Washington DC.\n\nApproach: PARTNERSHIP 뿯ν뿯½뿯½ Senior relationship. Position Trestleboard as AI content engine for HII's comms portfolio.\nEmail (verified): jaime.orlando@hii-tsd.com\nLinkedIn: linkedin.com/in/jaimeokeefe",addedAt:new Date().toISOString()},
  {id:"apollo_004",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Trish Csank",org:"LMI (Tysons, VA)",vertical:"Defense Contractor",confidence:97,intel:"VP Military Logistics Business Development 뿯ν뿯½뿯½ LMI holds $83.4M WHS/OSD StrComms contract EXPIRED July 2025. VP BD owns the recompete strategy. THIS IS THE HOTTEST LEAD. Baltimore MD.\n\nApproach: TEAMING 뿯ν뿯½뿯½ $83M OSD recompete is OPEN NOW. Position Trestleboard as narrative/AI subcontractor on their next WHS bid.\nEmail (verified): patricia.csank@lmi.org\nLinkedIn: linkedin.com/in/trisha-csank",addedAt:new Date().toISOString()},
  {id:"apollo_005",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Caitlyn Ottinger",org:"LMI (Tysons, VA)",vertical:"Defense Contractor",confidence:92,intel:"VP Marketing & Communications 뿯ν뿯½뿯½ internal comms buyer AND external contract strategist. Bristol VT.\n\nApproach: DIRECT 뿯ν뿯½뿯½ Pitch as AI narrative production partner for LMI's own communications + their OSD contract work.\nEmail (verified): caitlyn.ottinger@lmi.org\nLinkedIn: linkedin.com/in/caitlyn-o-57b7a8170",addedAt:new Date().toISOString()},
  {id:"apollo_006",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Marc Melkonian",org:"Booz Allen Hamilton",vertical:"Defense Contractor",confidence:91,intel:"Strategic Capture Director 뿯ν뿯½뿯½ Booz Allen holds $41.7M USAF + $9.8M DISA comms contracts. Capture Director for DoD accounts. Baltimore MD.\n\nApproach: TEAMING 뿯ν뿯½뿯½ Position as AI narrative layer under BAH's DoD comms programs.\nEmail (verified): melkonian_marc@bah.com\nLinkedIn: linkedin.com/in/marcmelkonian",addedAt:new Date().toISOString()},
  {id:"apollo_007",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Government Buyer)",name:"Whitney Trimble",org:"Defense Health Agency (DHA)",vertical:"Federal DoD",confidence:98,intel:"DIRECT GOVERNMENT BUYER 뿯ν뿯½뿯½ Director of Public Affairs and Community Outreach at DHA. DHA is spending $35M+ on comms contracts RIGHT NOW. This is the end-client decision-maker. Falls Church VA.\n\nApproach: DIRECT PITCH 뿯ν뿯½뿯½ DHA is actively buying. Lead with constituent comms acceleration, 200+ variant narrative production. Government email 뿯ν뿯½뿯½ use formal tone.\nEmail (verified): whitney.trimble@health.mil\nLinkedIn: linkedin.com/in/whitney-trimble-ma-scmp",addedAt:new Date().toISOString()},
  {id:"apollo_008",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Scott Gardner",org:"Ipsos Public Affairs",vertical:"Federal Civilian",confidence:88,intel:"VP 뿯ν뿯½뿯½ Ipsos holds $35.2M DHA Public Affairs contract through Nov 2026. VP is a relationship to lock in for teaming on renewal.\n\nApproach: PARTNERSHIP 뿯ν뿯½뿯½ Ipsos does research, Trestleboard does narrative execution. Pitch as their content production arm for DHA renewal.\nEmail (verified): scott.gardner@ipsos.com\nLinkedIn: linkedin.com/in/sgardner7",addedAt:new Date().toISOString()},
  {id:"apollo_009",source:"Apollo.io 뿯ν뿯½뿯½ Verified",name:"Sanyam Sethi",org:"Ipsos Public Affairs",vertical:"Federal Civilian",confidence:87,intel:"VP Public Affairs 뿯ν뿯½뿯½ $35.2M DHA contract. Key relationship for teaming on 2026 renewal. Toronto ON.\n\nApproach: PARTNERSHIP 뿯ν뿯½뿯½ Public Affairs VP is the strongest narrative fit. Ipsos research + Trestleboard narrative = complete offering.\nEmail (verified): sanyam.sethi@ipsos.com\nLinkedIn: linkedin.com/in/sanyamsethi",addedAt:new Date().toISOString()}
];

function loadApolloLeads() {
  if(!state.discoveryQueue) state.discoveryQueue = [];
  let added = 0;
  APOLLO_VERIFIED_LEADS.forEach(lead => {
    if(!state.discoveryQueue.find(x => x.id === lead.id)) {
      state.discoveryQueue.push(lead);
      added++;
    }
  });
  if(added > 0) {
    log('APOLLO ENRICHMENT', `${added} verified contacts loaded`);
    saveState();
  }
}

// Auto-load on first run (once)
(function(){
  if(!localStorage.getItem('claw_intel_v1')) {
    loadAgentIntel();
    localStorage.setItem('claw_intel_v1','1');
  }
  if(!localStorage.getItem('claw_apollo_v1')) {
    loadApolloLeads();
    localStorage.setItem('claw_apollo_v1','1');
  }
  if(!localStorage.getItem('claw_sf_v1')) {
    loadSouthFloridaLeads();
    localStorage.setItem('claw_sf_v1','1');
  }
})();

// South Florida + Local verified contacts
const SOUTH_FLORIDA_LEADS = [
  {id:"sf_001",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami-Dade Gov)",name:"Kendra Parks",org:"Miami-Dade County",vertical:"Local Government",confidence:91,intel:"Director of Communications 뿯ν뿯½뿯½ Miami-Dade County. Direct comms buyer for the county's largest municipality. South Florida local.\n\nApproach: DIRECT PITCH 뿯ν뿯½뿯½ County-level narrative production, constituent communications, press release automation. Lead with speed and volume capability.\nEmail (verified): kendra.parks@miamidade.gov\nLinkedIn: linkedin.com/in/kendraparks",addedAt:new Date().toISOString()},
  {id:"sf_002",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami-Dade Gov)",name:"Julio Rodriguez",org:"Miami-Dade County",vertical:"Local Government",confidence:90,intel:"Director of Communications 뿯ν뿯½뿯½ Miami-Dade County. Second comms director 뿯ν뿯½뿯½ likely owns different portfolio (Spanish-language, outreach, or departmental comms).\n\nApproach: DIRECT PITCH 뿯ν뿯½뿯½ Bilingual/multicultural narrative production angle. Miami-Dade is majority Spanish-speaking.\nEmail (verified): julio.rodriguez6@miamidade.gov\nLinkedIn: linkedin.com/in/julio-rodriguez-7aa39165",addedAt:new Date().toISOString()},
  {id:"sf_003",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami-Dade Gov)",name:"Kirsten Castillo",org:"Miami-Dade County",vertical:"Local Government",confidence:88,intel:"Business Development & Public Affairs Manager 뿯ν뿯½뿯½ Miami-Dade County. Dual BD + public affairs role 뿯ν뿯½뿯½ rare combo, very relevant to Trestleboard.\n\nApproach: DIRECT PITCH 뿯ν뿯½뿯½ BD + comms overlap. Perfect entry point for a county-wide narrative contract.\nEmail (verified): kirsten.castillo@miamidade.gov\nLinkedIn: linkedin.com/in/kirsten-castillo-1426a811a",addedAt:new Date().toISOString()},
  {id:"sf_004",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami-Dade Gov)",name:"Adriana Lamar",org:"Miami-Dade County",vertical:"Local Government",confidence:85,intel:"Public Affairs Manager 뿯ν뿯½뿯½ Miami-Dade County. Local public affairs contact. South Florida based.\n\nApproach: DIRECT 뿯ν뿯½뿯½ Intro Trestleboard's AI narrative platform for county public affairs operations.\nEmail (verified): alamar@co.miami-dade.fl.us\nLinkedIn: linkedin.com/in/adriana-lamar-5751b729",addedAt:new Date().toISOString()},
  {id:"sf_005",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami-Dade Gov)",name:"Ivonne Perez-Suarez",org:"Miami-Dade County Commissioner Office",vertical:"Local Government",confidence:84,intel:"Director of Communications 뿯ν뿯½뿯½ Commissioner Rebeca Sosa's Office. Direct access to a Miami-Dade Commissioner. Political communications buyer.\n\nApproach: DIRECT 뿯ν뿯½뿯½ Political narrative/comms production. Spanish-language capability is a major differentiator at the commissioner level.\nEmail (verified): ivonnes@miamidade.gov\nLinkedIn: linkedin.com/in/ivonne-perez-suarez-8b3a253",addedAt:new Date().toISOString()},
  {id:"sf_006",source:"Apollo.io 뿯ν뿯½뿯½ Verified (FL Legislature)",name:"Hannah Littlejohn",org:"Florida House of Representatives",vertical:"State Government",confidence:87,intel:"Deputy Communications Director, Office of the Speaker 뿯ν뿯½뿯½ Florida House of Representatives. This is the Speaker's comms shop. High-volume rapid narrative production is exactly what legislative comms needs.\n\nApproach: DIRECT PITCH 뿯ν뿯½뿯½ Legislative narrative acceleration, bill communications, constituent messaging at scale.\nEmail (verified): hannah.littlejohn@myfloridahouse.gov\nLinkedIn: linkedin.com/in/hannah-littlejohn-34893a185",addedAt:new Date().toISOString()},
  {id:"sf_007",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami Chamber)",name:"Alfred Sanchez",org:"Greater Miami Chamber of Commerce",vertical:"Local Business",confidence:93,intel:"President & CEO 뿯ν뿯½뿯½ Greater Miami Chamber of Commerce. Top business leader in South Florida. Gate to hundreds of Miami businesses. Strategic relationship for BD pipeline development.\n\nApproach: PARTNERSHIP 뿯ν뿯½뿯½ Position Trestleboard as the Chamber's AI communications partner. Offer member benefit program. This opens doors to the entire South FL business community.\nEmail (verified): asanchez@miamichamber.com\nLinkedIn: linkedin.com/in/alfredsanchez1",addedAt:new Date().toISOString()},
  {id:"sf_008",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami Chamber)",name:"Susan Snyder",org:"Greater Miami Chamber of Commerce",vertical:"Local Business",confidence:89,intel:"VP Communications 뿯ν뿯½뿯½ Greater Miami Chamber of Commerce. Fort Lauderdale/South Florida. Owns all Chamber communications 뿯ν뿯½뿯½ direct buyer for narrative and content production services.\n\nApproach: DIRECT PITCH 뿯ν뿯½뿯½ Chamber communications production, member spotlights, event narratives. High-volume content need.\nEmail (verified): ssnyder@miamichamber.com\nLinkedIn: linkedin.com/in/suesnyder",addedAt:new Date().toISOString()},
  {id:"sf_009",source:"Apollo.io 뿯ν뿯½뿯½ Verified (Miami Chamber)",name:"Jennifer Hanley (via Chamber)",org:"Greater Miami Chamber 뿯ν뿯½뿯½ L3Harris",vertical:"Defense Contractor",confidence:83,intel:"VP International Business Development & Government Relations 뿯ν뿯½뿯½ L3Harris Technologies. L3Harris is a major South Florida-headquartered defense prime (Melbourne, FL). Government relations VP = teaming and contract strategy.\n\nApproach: TEAMING 뿯ν뿯½뿯½ L3Harris does comms systems; Trestleboard does narrative content. Complementary. South Florida proximity.\nEmail (verified): jennifer.hanley@l3harris.com\nLinkedIn: linkedin.com/in/jennifer-hanley-99166422",addedAt:new Date().toISOString()},
  {id:"sf_010",source:"Apollo.io 뿯ν뿯½뿯½ Verified (L3Harris FL)",name:"Paul Cvar",org:"L3Harris Technologies",vertical:"Defense Contractor",confidence:88,intel:"Director Capture Management 뿯ν뿯½뿯½ L3Harris Technologies. L3Harris is Florida-HQ'd defense prime ($18B revenue). Capture Director owns teaming decisions for new bids.\n\nApproach: TEAMING 뿯ν뿯½뿯½ Pitch Trestleboard as AI narrative layer on L3Harris comms/IO contracts. Florida connection.\nEmail (verified): paul.cvar@l3harris.com\nLinkedIn: linkedin.com/in/pacvar78",addedAt:new Date().toISOString()},
  {id:"sf_011",source:"Apollo.io 뿯ν뿯½뿯½ Verified (L3Harris FL)",name:"Kristine Burnell",org:"L3Harris Technologies",vertical:"Defense Contractor",confidence:86,intel:"Director Strategy & Capture 뿯ν뿯½뿯½ L3Harris. Second capture director. L3Harris wins communications and information operations contracts across DoD.\n\nApproach: TEAMING 뿯ν뿯½뿯½ AI narrative production as L3Harris subcontractor on IO/comms programs.\nEmail (verified): kristine.burnell@l3harris.com\nLinkedIn: linkedin.com/in/kristine-burnell-0a55142a",addedAt:new Date().toISOString()},
  {id:"sf_012",source:"Apollo.io 뿯ν뿯½뿯½ Verified (L3Harris FL)",name:"Genevieve Hamer",org:"L3Harris Technologies",vertical:"Defense Contractor",confidence:85,intel:"Director Strategy & Capture 뿯ν뿯½뿯½ L3Harris. Third capture director across the L3Harris portfolio. High value for teaming.\n\nApproach: TEAMING 뿯ν뿯½뿯½ Same L3Harris play. Three capture directors = three shots at a teaming conversation.\nEmail (verified): genevieve.hamer@l3harris.com\nLinkedIn: linkedin.com/in/genevieve-hamer-215892110",addedAt:new Date().toISOString()}
];

function loadSouthFloridaLeads() {
  if(!state.discoveryQueue) state.discoveryQueue = [];
  let added = 0;
  SOUTH_FLORIDA_LEADS.forEach(lead => {
    if(!state.discoveryQueue.find(x => x.id === lead.id)) {
      state.discoveryQueue.push(lead);
      added++;
    }
  });
  if(added > 0) { log('SF INTEL LOADED', `${added} South Florida leads loaded`); saveState(); }
}

function updateConflictBadge() {
  const pending = (state.conflicts||[]).filter(c=>c.status==='pending').length;
  const badge = document.getElementById('nav-conflict-badge');
  if(badge) { badge.textContent = pending; badge.style.display = pending ? 'inline-flex' : 'none'; }
}



// ══ POST-JS ADDITIONS ════════════════════════════════════

// Build timestamp
(function() {
  var el = document.getElementById('build-ts');
  if (el) {
    try { var d = new Date('2026-03-04T06:35:51.808Z'); el.textContent = d.toLocaleString('en-US',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}) + ' ET'; }
    catch(e) { el.textContent = 'recent'; }
  }
})();

// Settings panel
function _openSettings() { mountIntelSections(); renderForecast(); renderAnalytics(); document.getElementById('settings-panel').style.display = 'block'; }
function _closeSettings() { document.getElementById('settings-panel').style.display = 'none'; }

// Toggle table view
var _tableOpen = false;
function _toggleTable() {
  _tableOpen = !_tableOpen;
  var t = document.getElementById('pview-table');
  if (t) { t.style.display = _tableOpen ? 'block' : 'none'; }
  if (_tableOpen) renderLeadTable();
}

// INTEL QUEUE RENDER (compact rows)
function _renderIntelQueue() {
  var el = document.getElementById('intel-queue-list');
  if (!el) return;
  var q = (state && state.discoveryQueue) || [];

  // Update counts
  var c2 = document.getElementById('cmd-intel-count2');
  if (c2) c2.textContent = q.length;
  var ci = document.getElementById('cmd-intel-count');
  if (ci) ci.textContent = q.length;

  if (!q.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted2)"><div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">QUEUE EMPTY</div><div style="font-size:8px;margin-bottom:12px;color:var(--muted)">Click Reload to restore contacts</div><button class="btn xs primary" onclick="_reloadAllLeads()">RELOAD ALL</button></div>';
    return;
  }

  var html = '';
  q.forEach(function(item) {
    var cc = item.confidence >= 85 ? 'ch' : item.confidence >= 70 ? 'cm' : 'cl';
    var lines = (item.intel || '').split('\n');
    var emailLine = lines.find(function(l) { return l.toLowerCase().indexOf('email') > -1; }) || '';
    var emailMatch = emailLine.match(/:\s*([^\s(]+@[^\s]+)/);
    var emailVal = emailMatch ? emailMatch[1].trim() : '';

    html += '<div class="crow" id="crow-' + item.id + '" onclick="_toggleCrow(this, ' + JSON.stringify(item.id) + ')">';
    html += '<div class="cconf ' + cc + '">' + item.confidence + '%</div>';
    html += '<div class="cinfo"><div class="cname">' + (item.name || 'Unknown') + '</div>';
    html += '<div class="crole">' + (lines[0] || '').substring(0, 45) + '</div>';
    html += '<div class="corg">' + (item.org || '') + '</div>';
    if (item.location) html += '<div class="cloc">' + item.location + '</div>';
    html += '</div>';
    html += '<div class="crow-btns">';
    html += '<button class="btn xs primary" data-discid="' + item.id + '" onclick="event.stopPropagation();_addToP(this)">+ PIPELINE</button>';
    if (emailVal) html += '<a href="mailto:' + emailVal + '" class="btn xs" onclick="event.stopPropagation()">EMAIL</a>';
    html += '</div></div>';
    html += '<div class="crow-detail" id="cdet-' + item.id + '">';
    html += '<div class="crow-intel">' + (item.intel || '').replace(/</g, '&lt;') + '</div>';
    html += '<div class="crow-foot">';
    html += '<button class="btn success sm" data-discid="' + item.id + '" onclick="_addToP(this)">ADD TO PIPELINE</button>';
    html += '<button class="btn-start-pipeline locked" data-discid="' + item.id + '" onclick="_startP(this)">START PIPELINE</button>';
    html += '<button class="btn danger sm" data-discid="' + item.id + '" onclick="_dismissP(this)">DISMISS</button>';
    html += '</div></div>';
  });

  el.innerHTML = html;
}

function _toggleCrow(el, id) {
  var det = document.getElementById('cdet-' + id);
  if (!det) return;
  var open = det.classList.contains('open');
  document.querySelectorAll('.crow-detail.open').forEach(function(d) { d.classList.remove('open'); });
  document.querySelectorAll('.crow.expanded-row').forEach(function(r) { r.classList.remove('expanded-row'); });
  if (!open) { det.classList.add('open'); el.classList.add('expanded-row'); }
}

function _addToP(btn) { importDiscoveryLead(btn.getAttribute('data-discid')); }
function _dismissP(btn) { dismissDiscoveryLead(btn.getAttribute('data-discid')); _renderIntelQueue(); }
function _startP(btn) {
  var discId = btn.getAttribute('data-discid');
  var qItem = (state.discoveryQueue || []).find(function(x) { return x.id === discId; });
  var lead = state.leads.find(function(l) { return l.name === (qItem && qItem.name); });
  if (lead && lead.contactApproved) { toast('Pipeline started for ' + lead.name); log('PIPELINE START', lead.name); }
  else if (lead) { toast('LOCKED — Approve contact in lead dossier first.'); }
  else { toast('Add to Pipeline first, then approve contact.'); }
}

function _reloadAllLeads() {
  localStorage.removeItem('claw_intel_v1');
  localStorage.removeItem('claw_apollo_v1');
  localStorage.removeItem('claw_sf_v1');
  state.discoveryQueue = [];
  if (typeof loadAgentIntel === 'function') loadAgentIntel();
  if (typeof loadApolloLeads === 'function') loadApolloLeads();
  if (typeof loadSouthFloridaLeads === 'function') loadSouthFloridaLeads();
  _renderIntelQueue();
  toast('Reloaded — ' + (state.discoveryQueue || []).length + ' contacts in queue');
}

// Patch renderAll to update our new elements
var _origRA = typeof renderAll === 'function' ? renderAll : function(){};
renderAll = function() {
  _origRA();
  _updateStats();
  _renderIntelQueue();
  renderKanban();
};

function _updateStats() {
  var act = state.leads.filter(function(l) { return !['Closed','Archived'].includes(l.status); });
  var ev = calcEV();
  var evEl = document.getElementById('tm-pipeline'); if (evEl) evEl.textContent = '$' + fmtNum(Math.round(ev.base));
  var aEl = document.getElementById('cmd-active'); if (aEl) aEl.textContent = act.length;
  var dEl = document.getElementById('cmd-decay'); if (dEl) dEl.textContent = act.filter(function(l){return decayDays(l)>1;}).length;
  var ts = document.getElementById('cmd-total-sub'); if (ts) ts.textContent = state.leads.length + ' total';
  var md = document.getElementById('mode-display'); if (md) md.textContent = state.autonomyMode || 'SEMI-AUTO';
}

// Shim: showPage does nothing (no pages to switch)
showPage = function(id, btn) { if (id === 'intel') { _renderIntelQueue(); } };

// On load
window.addEventListener('load', function() {
  _updateStats();
  _renderIntelQueue();
  renderKanban();
});
