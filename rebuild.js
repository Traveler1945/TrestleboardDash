const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// ─── Extract inner HTML of a section div ─────────────────────────
function extractSectionInner(src, id) {
  const marker = `id="section-${id}"`;
  const markerIdx = src.indexOf(marker);
  if (markerIdx === -1) return `<!-- section-${id} not found -->`;
  const divStart = src.lastIndexOf('<div', markerIdx);
  let depth = 0, i = divStart;
  while (i < src.length) {
    if (src[i] === '<') {
      if (src.slice(i, i+4) === '<div') depth++;
      else if (src.slice(i, i+6) === '</div') { depth--; if (depth === 0) { return src.slice(divStart, i+6); } }
    }
    i++;
  }
  return `<!-- section-${id} extraction failed -->`;
}

// ─── Extract ALL modal-overlay divs ──────────────────────────────
function extractModals(src) {
  const result = [];
  let from = 0;
  while (true) {
    const idx = src.indexOf('<div class="modal-overlay"', from);
    if (idx === -1) break;
    let depth = 0, i = idx;
    while (i < src.length) {
      if (src[i] === '<') {
        if (src.slice(i, i+4) === '<div') depth++;
        else if (src.slice(i, i+6) === '</div') { depth--; if (depth === 0) { result.push(src.slice(idx, i+6)); from = i+6; break; } }
      }
      i++;
    }
    if (from === 0) break;
  }
  return result.join('\n\n');
}

// ─── Extract the auth gate ────────────────────────────────────────
function extractAuthGate(src) {
  const idx = src.indexOf('<div id="auth-gate">');
  if (idx === -1) return '';
  let depth = 0, i = idx;
  while (i < src.length) {
    if (src[i] === '<') {
      if (src.slice(i, i+4) === '<div') depth++;
      else if (src.slice(i, i+6) === '</div') { depth--; if (depth === 0) return src.slice(idx, i+6); }
    }
    i++;
  }
  return '';
}

// ─── Extract the main JS block ────────────────────────────────────
function extractJS(src) {
  // Find the data.js script tag, then find the next <script> after it
  const datajsIdx = src.indexOf('<script src="data.js"></script>');
  if (datajsIdx === -1) return '// data.js tag NOT FOUND';
  const nextScript = src.indexOf('<script>', datajsIdx);
  if (nextScript === -1) return '// main script block NOT FOUND';
  const jsStart = nextScript + '<script>'.length;
  const jsEnd = src.lastIndexOf('</script>');
  return src.slice(jsStart, jsEnd);
}

const authGate = extractAuthGate(html);
const modals = extractModals(html);
const mainJS = extractJS(html);

// ─── Section HTML ─────────────────────────────────────────────────
const sCmd      = extractSectionInner(html, 'command');
const sPipeline = extractSectionInner(html, 'pipeline');
const sLeads    = extractSectionInner(html, 'leads');
const sForecast = extractSectionInner(html, 'forecast');
const sOutreach = extractSectionInner(html, 'outreach');
const sContent  = extractSectionInner(html, 'content');
const sObj      = extractSectionInner(html, 'objections');
const sMeet     = extractSectionInner(html, 'meetings');
const sAgents   = extractSectionInner(html, 'agents');
const sSim      = extractSectionInner(html, 'simulation');
const sConst    = extractSectionInner(html, 'constraints');
const sAudit    = extractSectionInner(html, 'auditlog');
const sAnalytics= extractSectionInner(html, 'analytics');
const sDisc     = extractSectionInner(html, 'discovery');

// ─── Build ────────────────────────────────────────────────────────
const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Clawbot // Trestleboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
/* ── Reset ── */
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060608;--surface:#0e0e12;--surface2:#16161c;--border:#1e1e28;
  --accent:#c8a84b;--accent2:#e8c76b;--danger:#cc3333;--warn:#cc7722;
  --success:#2a9a4a;--text:#e0e0e8;--muted:#555566;--blue:#2a5aaa;
  --hold:#8a68ff;--info:#1f4d8f;
}
body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;font-size:13px;min-height:100vh;}

/* ── Auth Gate ── */
#auth-gate{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:99999;flex-direction:column;gap:0}
#auth-gate.hidden{display:none}
.auth-box{background:var(--surface);border:1px solid var(--accent);padding:48px 56px;width:400px;text-align:center}
.auth-logo{font-size:22px;letter-spacing:6px;color:var(--accent);font-weight:bold;margin-bottom:4px}
.auth-tagline{font-size:9px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px}
.auth-div{border-top:1px solid var(--border);margin:24px 0}
.auth-box input[type="password"]{width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:14px;font-family:inherit;font-size:16px;text-align:center;letter-spacing:6px;margin-bottom:14px}
.auth-box input:focus{outline:1px solid var(--accent)}
.auth-btn{width:100%;background:none;border:1px solid var(--accent);color:var(--accent);padding:12px;font-family:inherit;font-size:11px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .2s}
.auth-btn:hover{background:var(--accent);color:var(--bg)}
.auth-error{color:var(--danger);font-size:10px;margin-top:12px;min-height:16px;letter-spacing:1px}
.auth-classify{font-size:9px;color:var(--muted);letter-spacing:2px;margin-top:32px}

/* ── Topbar ── */
.topbar{display:flex;align-items:center;justify-content:space-between;background:var(--surface);border-bottom:1px solid var(--border);padding:10px 24px;position:sticky;top:0;z-index:100;gap:16px}
.logo-main{font-size:14px;font-weight:bold;color:var(--accent);letter-spacing:4px}
.top-controls{display:flex;gap:6px;align-items:center}
.mode-btn{border:1px solid var(--border);background:transparent;color:var(--muted);padding:4px 10px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit}
.mode-btn.manual.active{border-color:#2a5aaa;color:#7ab0ff}
.mode-btn.semi.active{border-color:var(--accent);color:var(--accent)}
.mode-btn.full.active{border-color:var(--success);color:var(--success)}
.mode-btn:focus{outline:none}
.brief-btn{border-color:var(--accent);color:var(--accent)}
.top-right{display:flex;gap:12px;align-items:center;font-size:10px;color:var(--muted)}
#current-time{color:var(--muted);font-size:10px}

/* ── Main Nav (3-pill) ── */
.main-nav{display:flex;background:var(--surface);border-bottom:1px solid var(--border);padding:8px 24px;gap:4px}
.nav-pill{background:transparent;border:none;color:var(--muted);padding:6px 18px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:2px;text-transform:uppercase;border-radius:2px;transition:all .15s}
.nav-pill:hover{color:var(--text)}
.nav-pill.active{background:var(--surface2);color:var(--accent)}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;padding:0 4px;font-size:8px;border-radius:8px;background:var(--danger);color:#fff;margin-left:4px}

/* ── Pages ── */
.page{display:none;padding:20px 24px}
.page.active{display:block}

/* ── Command Page ── */
.cmd-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin-bottom:20px}
.cmd-metric{background:var(--surface);padding:20px 16px;text-align:center}
.cmd-metric-val{font-size:28px;color:var(--accent);font-weight:bold;line-height:1}
.cmd-metric-val.danger{color:var(--danger)}
.cmd-metric-val.warn{color:var(--warn)}
.cmd-metric-val.success{color:var(--success)}
.cmd-metric-lbl{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-top:6px}
.cmd-body{display:grid;grid-template-columns:3fr 2fr;gap:20px;margin-bottom:16px}
.cmd-priority-label{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
.priority-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-left:2px solid var(--border);margin-bottom:6px}
.priority-row.hot-border{border-left-color:var(--danger)}
.priority-row.warm-border{border-left-color:var(--warn)}
.priority-row.cool-border{border-left-color:var(--success)}
.priority-row-info{flex:1;min-width:0}
.priority-row-name{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.priority-row-sub{font-size:9px;color:var(--muted);margin-top:2px}
.priority-row-nba{font-size:10px;color:#9ec5ff;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.priority-row-actions{display:flex;flex-direction:column;gap:4px;align-items:flex-end}
.cmd-charts{display:flex;flex-direction:column;gap:16px}
.cmd-chart-card{background:var(--surface);padding:14px;border:1px solid var(--border)}
.cmd-chart-title{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
.alert-strip{background:#1a0a00;border-left:3px solid var(--warn);padding:8px 14px;margin-bottom:8px;font-size:11px;color:var(--warn);display:flex;justify-content:space-between;align-items:center}
.alert-strip.danger{background:#1a0000;border-left-color:var(--danger);color:var(--danger)}
.constraint-bar{font-size:9px;color:var(--muted);letter-spacing:1px;padding:8px 0;border-top:1px solid var(--border);margin-top:8px}
.constraint-bar span{color:var(--accent);margin-right:6px}

/* ── Pipeline Page ── */
.pipeline-sub-nav{display:flex;gap:4px;margin-bottom:16px}
.sub-pill{background:transparent;border:1px solid var(--border);color:var(--muted);padding:5px 16px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:2px;text-transform:uppercase;border-radius:2px}
.sub-pill.active{background:var(--surface2);border-color:var(--accent);color:var(--accent)}
.pipeline-view{display:none}
.pipeline-view.active{display:block}

/* ── FAB ── */
.fab{position:fixed;bottom:28px;right:28px;background:var(--accent);color:var(--bg);border:none;width:48px;height:48px;border-radius:50%;font-size:22px;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.4);z-index:200;font-family:inherit}
.fab.visible{display:flex}
.fab:hover{background:var(--accent2)}

/* ── Intel Page (Accordion) ── */
.accordion{display:flex;flex-direction:column;gap:2px}
.accordion-header{display:flex;justify-content:space-between;align-items:center;background:var(--surface);padding:12px 16px;cursor:pointer;border-left:2px solid transparent;user-select:none}
.accordion-header:hover{background:var(--surface2)}
.accordion-header.open{border-left-color:var(--accent)}
.accordion-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.accordion-header.open .accordion-title{color:var(--accent)}
.accordion-chevron{font-size:10px;color:var(--muted);transition:transform .2s}
.accordion-header.open .accordion-chevron{transform:rotate(180deg);color:var(--accent)}
.accordion-body{display:none;background:var(--surface2);padding:20px;border-left:2px solid var(--accent)}

/* ── Buttons ── */
.btn{background:none;border:1px solid var(--border);color:var(--text);padding:6px 14px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1px;text-transform:uppercase;transition:all .2s;white-space:nowrap}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn.primary{border-color:var(--accent);color:var(--accent)}
.btn.primary:hover{background:var(--accent);color:var(--bg)}
.btn.danger{border-color:var(--danger);color:var(--danger)}
.btn.danger:hover{background:var(--danger);color:#fff}
.btn.success{border-color:var(--success);color:var(--success)}
.btn.success:hover{background:var(--success);color:#fff}
.btn.warn{border-color:var(--warn);color:var(--warn)}
.btn.sm{padding:3px 8px;font-size:9px}
.btn.link{border:none;color:var(--muted);padding:2px 4px;font-size:9px;letter-spacing:0;text-transform:none}
.btn.link:hover{color:var(--accent);border:none;background:none}

/* ── Forms ── */
.form-group{margin-bottom:12px}
label{display:block;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
input,textarea,select{width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:7px 10px;font-family:inherit;font-size:12px}
input:focus,textarea:focus,select:focus{outline:1px solid var(--accent)}
textarea{resize:vertical;min-height:70px}
select{cursor:pointer}

/* ── Stats Row (inside sections) ── */
.stats-row{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.stat-card{background:var(--surface);border:1px solid var(--border);border-top:2px solid var(--accent);padding:14px 18px;flex:1;min-width:100px}
.stat-card.warn{border-top-color:var(--warn)}
.stat-card.danger{border-top-color:var(--danger)}
.stat-card.success{border-top-color:var(--success)}
.stat-value{font-size:24px;color:var(--accent);font-weight:bold}
.stat-card.warn .stat-value{color:var(--warn)}
.stat-card.danger .stat-value{color:var(--danger)}
.stat-card.success .stat-value{color:var(--success)}
.stat-label{font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:4px}
.stat-sub{font-size:9px;color:var(--muted);margin-top:2px}

/* ── Section header (inside accordion/pipeline) ── */
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.section-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--accent)}
.section-actions{display:flex;gap:6px;flex-wrap:wrap}

/* ── Kanban ── */
.kanban{display:flex;gap:8px;overflow-x:auto;padding-bottom:12px}
.kanban-col{min-width:170px;flex:1;background:var(--surface);border:1px solid var(--border)}
.kanban-col-header{padding:8px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.kanban-col-title{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.kanban-col-count{font-size:9px;color:var(--muted)}
.kanban-col-body{padding:6px;min-height:80px}
.kanban-card{background:var(--surface2);border-left:2px solid var(--muted);padding:8px 10px;margin-bottom:6px;cursor:grab;transition:border-color .15s}
.kanban-card:hover{border-left-color:var(--accent)}
.kanban-card.dragging{opacity:.3}
.kanban-card.decay-hot{border-left-color:var(--danger)}
.kanban-card.decay-warn{border-left-color:var(--warn)}
.kanban-card.decay-ok{border-left-color:var(--success)}
.kanban-col.drag-over{background:#1a1500;border-color:var(--accent)}
.card-name{font-size:11px;margin-bottom:2px}
.card-org{font-size:9px;color:var(--muted);margin-bottom:4px}
.card-score-bar{height:2px;background:var(--border);margin-bottom:4px;border-radius:1px;overflow:hidden}
.card-score-fill{height:100%}
.card-score-label{font-size:9px;color:var(--muted);margin-bottom:4px}
.card-actions{display:flex;gap:3px;flex-wrap:wrap}

/* ── Tables ── */
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:6px 10px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border)}
td{padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:middle;font-size:11px}
tr:hover td{background:var(--surface2)}

/* ── Score Badge ── */
.score-badge{display:inline-flex;align-items:center;justify-content:center;width:34px;height:20px;font-size:10px;font-weight:bold;border:1px solid}
.score-hot{background:#200a0a;border-color:#cc3333;color:#ff6666}
.score-warm{background:#201000;border-color:var(--warn);color:#ffaa44}
.score-cool{background:#0a1a0a;border-color:var(--success);color:#66cc88}
.score-cold{background:var(--surface2);border-color:var(--border);color:var(--muted)}

/* ── Tags ── */
.tag{display:inline-block;padding:2px 6px;font-size:9px;letter-spacing:1px;text-transform:uppercase;border:1px solid}
.tag.amber{background:#1a1200;border-color:#5a3a00;color:var(--accent)}
.tag.green{background:#0a180a;border-color:#2a6a3a;color:#6acc8c}
.tag.red{background:#180a0a;border-color:#6a2a2a;color:#cc6a6a}
.tag.blue{background:#0a1020;border-color:#2a4a8a;color:#6a9acc}
.tag.gray{background:var(--surface2);border-color:var(--border);color:var(--muted)}
.tag.warn{background:#180f00;border-color:#6a3a00;color:#cc8833}

/* ── Decay ── */
.decay-indicator{font-size:9px;letter-spacing:1px}
.decay-hot{color:var(--danger)}
.decay-warn{color:var(--warn)}
.decay-ok{color:var(--success)}

/* ── Priority Badge ── */
.priority-badge{padding:2px 7px;border:1px solid;font-size:9px;letter-spacing:1px;text-transform:uppercase}
.priority-critical{background:#1a0000;border-color:var(--danger);color:#ff7a7a}
.priority-high{background:#1a0f00;border-color:var(--warn);color:#ffb347}
.priority-med{background:#0a1a0f;border-color:#2a8a58;color:#6ad4a1}
.priority-low{background:var(--surface2);border-color:var(--border);color:var(--muted)}

/* ── Hold / Info badges ── */
.hold-badge{background:#1a0a2a;border:1px solid var(--hold);color:var(--hold);padding:2px 6px;font-size:9px;letter-spacing:1px;text-transform:uppercase}
.info-panel{background:#081224;border:1px solid var(--info);border-left:4px solid var(--info);padding:10px 14px;color:#9ec5ff;font-size:11px;margin-bottom:12px}
.info-panel strong{color:#fff}

/* ── Agent cards ── */
.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:16px}
.agent-card{background:var(--surface);border:1px solid var(--border);border-top:2px solid var(--accent);padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.agent-card h4{font-size:11px;color:var(--accent);letter-spacing:1px;text-transform:uppercase}
.agent-card p{font-size:10px;color:var(--muted);line-height:1.4}
.agent-card .agent-meta{display:flex;justify-content:space-between;font-size:9px;color:var(--muted)}
.agent-conflict{background:#1a0000;border:1px solid var(--danger);color:var(--danger);padding:2px 6px;font-size:9px;letter-spacing:1px;text-transform:uppercase}

/* ── Conflict list ── */
.conflict-list{display:flex;flex-direction:column;gap:8px}
.conflict-item{background:var(--surface2);border:1px solid var(--border);padding:10px 12px}
.conflict-item h5{font-size:10px;color:var(--accent);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.conflict-item p{font-size:10px;color:#aaa;margin-bottom:4px}
.conflict-status{font-size:9px;letter-spacing:1px;text-transform:uppercase}
.conflict-status.pending{color:var(--warn)}
.conflict-status.resolved{color:var(--success)}

/* ── Simulation ── */
.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sim-card{background:var(--surface);border:1px solid var(--border);padding:14px}
.sim-card h4{font-size:10px;letter-spacing:2px;color:var(--accent);text-transform:uppercase;margin-bottom:8px}
.sim-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sim-output{margin-top:12px;background:var(--surface2);border:1px solid var(--border);padding:12px;font-size:11px;line-height:1.6;color:#cfd6ff;min-height:100px;white-space:pre-wrap}

/* ── Constraints panel ── */
.constraints-panel{background:var(--surface);border:1px solid var(--border);padding:16px;margin-bottom:12px}
.constraints-panel h4{font-size:10px;color:var(--accent);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
.constraints-panel ol{padding-left:16px;font-size:11px;line-height:1.6;color:#ccc}
.constraints-panel li{margin-bottom:4px}
.constraints-subgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.constraints-subgrid div{background:var(--surface2);border:1px solid var(--border);padding:10px;font-size:10px;line-height:1.5}
.constraints-subgrid strong{color:var(--accent);display:block;margin-bottom:3px;letter-spacing:1px}

/* ── Forecast ── */
.forecast-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px}
.forecast-card{background:var(--surface);border:1px solid var(--border);padding:16px;text-align:center}
.forecast-card.conservative{border-top:2px solid var(--muted)}
.forecast-card.base{border-top:2px solid var(--accent)}
.forecast-card.upside{border-top:2px solid var(--success)}
.forecast-val{font-size:22px;font-weight:bold;color:var(--accent)}
.forecast-card.conservative .forecast-val{color:var(--muted)}
.forecast-card.upside .forecast-val{color:var(--success)}
.forecast-label{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-top:4px}
.forecast-desc{font-size:10px;color:var(--muted);margin-top:6px}

/* ── Pipeline bars ── */
.pipeline-row{display:flex;gap:8px;margin-bottom:8px}
.pipeline-stage-label{font-size:9px;color:var(--muted);width:110px;flex-shrink:0;padding-top:5px;letter-spacing:1px}
.pipeline-bar-wrap{flex:1;background:var(--surface2);height:24px;position:relative;border:1px solid var(--border)}
.pipeline-bar-fill{height:100%;background:var(--accent);opacity:.6;transition:width .4s}
.pipeline-bar-label{position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:9px;color:var(--text)}
.pipeline-ev{width:80px;text-align:right;font-size:10px;color:var(--accent);padding-top:4px}

/* ── Objections ── */
.obj-card{background:var(--surface);border:1px solid var(--border);border-left:2px solid var(--warn);padding:12px 14px;margin-bottom:8px}
.obj-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.obj-type{font-size:11px;color:var(--warn);letter-spacing:1px}
.obj-vertical{font-size:9px;color:var(--muted)}
.obj-counter{font-size:10px;color:#aaa;margin-bottom:6px;line-height:1.5}

/* ── Campaigns ── */
.sequence-card{background:var(--surface);border:1px solid var(--border);padding:14px;margin-bottom:8px}
.sequence-header{display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.sequence-title{font-size:12px;margin-bottom:2px}
.sequence-meta{font-size:10px;color:var(--muted)}
.sequence-steps{display:flex;gap:0;margin-bottom:10px}
.step{flex:1;padding:6px 4px;border:1px solid var(--border);font-size:9px;text-align:center;color:var(--muted);background:var(--surface2)}
.step.done{border-color:var(--success);color:var(--success);background:#0a180a}
.step.active{border-color:var(--accent);color:var(--accent);background:#1a1200}
.sequence-actions{display:flex;gap:5px;flex-wrap:wrap}

/* ── Content Queue ── */
.queue-card{background:var(--surface);border:1px solid var(--border);border-left:2px solid var(--accent);padding:14px;margin-bottom:8px}
.queue-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.queue-card-title{font-size:12px;margin-bottom:2px}
.queue-card-meta{font-size:10px;color:var(--muted)}
.queue-card-body{font-size:11px;color:#999;margin-bottom:8px;line-height:1.5}
.queue-card-actions{display:flex;gap:5px;flex-wrap:wrap}

/* ── Meetings ── */
.meeting-card{background:var(--surface);border:1px solid var(--border);padding:14px;margin-bottom:8px}
.meeting-header{display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px}

/* ── Audit Log ── */
.log-entry{display:flex;gap:12px;padding:5px 0;border-bottom:1px solid var(--border);font-size:10px}
.log-time{color:var(--muted);white-space:nowrap;min-width:130px}
.log-actor{color:var(--accent);min-width:70px}
.log-action{color:var(--text)}

/* ── Dossier ── */
.dossier{background:var(--surface2);border:1px solid var(--border);padding:14px;font-size:12px;line-height:1.8}
.dossier h4{color:var(--accent);letter-spacing:1px;text-transform:uppercase;font-size:10px;margin:12px 0 4px;border-bottom:1px solid var(--border);padding-bottom:3px}
.dossier p{color:#aaa}
.score-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.score-row{background:var(--surface2);border:1px solid var(--border);padding:6px 10px}
.score-row-label{font-size:9px;color:var(--muted);letter-spacing:1px}
.score-row-val{font-size:13px;color:var(--accent);font-weight:bold;margin-top:2px}

/* ── Modal ── */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:1000;align-items:center;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--accent);width:540px;max-width:95vw;max-height:90vh;overflow-y:auto}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border)}
.modal-title{color:var(--accent);letter-spacing:2px;text-transform:uppercase;font-size:11px}
.modal-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px}
.modal-body{padding:18px}
.modal-footer{padding:12px 18px;border-top:1px solid var(--border);display:flex;gap:6px;justify-content:flex-end}

/* ── Discovery ── */
.discovery-toggle{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.disc-mode-btn{border:1px solid var(--border);background:transparent;color:var(--muted);padding:5px 12px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit}
.disc-mode-btn.active-off{border-color:var(--muted);color:var(--muted)}
.disc-mode-btn.active-searching{border-color:var(--success);color:var(--success)}
.disc-mode-btn.active-paused{border-color:var(--warn);color:var(--warn)}
.disc-log{background:var(--bg);border:1px solid var(--border);padding:10px;font-size:10px;max-height:180px;overflow-y:auto;margin-top:12px;color:var(--muted)}

/* ── Analytics Charts ── */
.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chart-card{background:var(--surface);border:1px solid var(--border);padding:16px}
.chart-card-title{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.chart-card.full{grid-column:span 2}

/* ── Toast ── */
#toast{position:fixed;bottom:20px;right:20px;background:var(--surface);border:1px solid var(--accent);color:var(--accent);padding:8px 16px;font-size:10px;letter-spacing:1px;z-index:9999;display:none;max-width:300px}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border)}
::-webkit-scrollbar-thumb:hover{background:var(--muted)}

@media(max-width:768px){
  .cmd-body{grid-template-columns:1fr}
  .cmd-metrics{grid-template-columns:1fr 1fr}
  .sim-grid{grid-template-columns:1fr}
  .chart-grid{grid-template-columns:1fr}
  .chart-card.full{grid-column:span 1}
  .forecast-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>

${authGate}

<!-- ─── TOPBAR ─────────────────────────────────────────── -->
<div class="topbar">
  <div class="logo-main">CLAWBOT <span style="color:var(--muted);font-size:10px">// TRESTLEBOARD</span></div>
  <div class="top-controls">
    <span style="font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase">Mode</span>
    <div id="mode-selector" style="display:flex;gap:3px">
      <button class="mode-btn manual" data-mode="MANUAL" onclick="setAutonomyMode('MANUAL')">Manual</button>
      <button class="mode-btn semi" data-mode="SEMI-AUTO" onclick="setAutonomyMode('SEMI-AUTO')">Semi</button>
      <button class="mode-btn full" data-mode="FULL AUTO" onclick="setAutonomyMode('FULL AUTO')">Full</button>
    </div>
    <button class="btn sm brief-btn" onclick="openStrategicBrief()">Brief</button>
  </div>
  <span id="current-time"></span>
</div>

<!-- ─── MAIN NAV (3 pills) ───────────────────────────────── -->
<div class="main-nav">
  <button class="nav-pill active" onclick="showPage('command',this)">Command</button>
  <button class="nav-pill" onclick="showPage('pipeline',this)">Pipeline</button>
  <button class="nav-pill" onclick="showPage('intel',this)">Intel <span class="badge" id="nav-conflict-badge" style="display:none">0</span></button>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- PAGE 1: COMMAND                                         -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="page active" id="page-command">

  <!-- Alert strip -->
  <div id="alert-container" style="margin-bottom:4px"></div>

  <!-- 4 big metric tiles -->
  <div class="cmd-metrics">
    <div class="cmd-metric">
      <div class="cmd-metric-val" id="tm-pipeline">$0</div>
      <div class="cmd-metric-lbl">Pipeline EV</div>
    </div>
    <div class="cmd-metric">
      <div class="cmd-metric-val success" id="cmd-active">0</div>
      <div class="cmd-metric-lbl">Active Leads</div>
    </div>
    <div class="cmd-metric">
      <div class="cmd-metric-val warn" id="cmd-decay">0</div>
      <div class="cmd-metric-lbl">Decay Risk</div>
    </div>
    <div class="cmd-metric">
      <div class="cmd-metric-val danger" id="cmd-stale">0</div>
      <div class="cmd-metric-lbl">Stale 72h+</div>
    </div>
  </div>

  <!-- hidden legacy metric IDs -->
  <span id="cmd-total" style="display:none"></span>
  <span id="tm-leads" style="display:none"></span>
  <span id="tm-decay" style="display:none"></span>
  <span id="cmd-briefings" style="display:none"></span>
  <span id="cmd-closed" style="display:none"></span>

  <div id="hold-info"></div>

  <!-- Priority stack + mini charts -->
  <div class="cmd-body">
    <div>
      <div class="cmd-priority-label">Priority Stack — Next Best Actions</div>
      <div id="cmd-hot-leads"></div>
    </div>
    <div class="cmd-charts">
      <div class="cmd-chart-card">
        <div class="cmd-chart-title">Pipeline by Stage</div>
        <canvas id="mini-funnel-chart" height="120"></canvas>
      </div>
      <div class="cmd-chart-card">
        <div class="cmd-chart-title">Decay Health</div>
        <canvas id="mini-decay-chart" height="90"></canvas>
      </div>
    </div>
  </div>

  <!-- Constraint reminder -->
  <div class="constraint-bar" id="constraints-banner">
    <span>MODE: SEMI-AUTO</span> NEVER send >1 touch/72h · NEVER discount >10% without approval · Compliance lock
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- PAGE 2: PIPELINE                                        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="page" id="page-pipeline">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <div class="pipeline-sub-nav">
      <button class="sub-pill active" onclick="showPipelineView('kanban',this)">Kanban</button>
      <button class="sub-pill" onclick="showPipelineView('table',this)">Table</button>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn sm" onclick="exportLeads()">Export</button>
    </div>
  </div>

  <div class="pipeline-view active" id="pview-kanban">
    <div class="kanban" id="kanban-board"></div>
  </div>

  <div class="pipeline-view" id="pview-table">
    <table>
      <thead><tr>
        <th>Score</th><th>Lead</th><th>Org</th><th>Vertical</th>
        <th>Stage</th><th>Decay</th><th>Priority</th><th>NBA</th><th>Profile</th><th>Value</th><th>Actions</th>
      </tr></thead>
      <tbody id="lead-tbody"></tbody>
    </table>
  </div>

  <!-- FAB -->
  <button class="fab visible" id="fab-add" onclick="openAddLead()">+</button>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- PAGE 3: INTEL                                           -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="page" id="page-intel">
  <div class="accordion">

    <!-- Discovery -->
    <div class="accordion-header open" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Agent Discovery</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body" style="display:block">
      <div id="section-discovery-inner"></div>
    </div>

    <!-- Analytics -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Analytics</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-analytics-inner"></div>
    </div>

    <!-- Forecast -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Revenue Forecast</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-forecast-inner"></div>
    </div>

    <!-- Simulation -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Simulation Engine</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-simulation-inner"></div>
    </div>

    <!-- Campaigns -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Campaign Orchestration</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-outreach-inner"></div>
    </div>

    <!-- Content Queue -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Content Queue</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-content-inner"></div>
    </div>

    <!-- Objections -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Objection Registry</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-objections-inner"></div>
    </div>

    <!-- Meetings -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Briefings & Meetings</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-meetings-inner"></div>
    </div>

    <!-- Agents -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Agent Mesh <span class="badge" id="agent-conflict-badge-intel" style="display:none">0</span></span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-agents-inner"></div>
    </div>

    <!-- Constraints -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Constraints & Doctrine</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-constraints-inner"></div>
    </div>

    <!-- Audit Log -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">Audit Log</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-auditlog-inner"></div>
    </div>

  </div>
</div>

${modals}

<div id="toast"></div>

<script src="data.js"></script>
<script>
// ─── PAGE / ACCORDION NAVIGATION ─────────────────────────
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
    'section-discovery-inner': ${JSON.stringify(extractSectionContent('section-discovery', sDisc))},
    'section-analytics-inner': ${JSON.stringify(extractSectionContent('section-analytics', sAnalytics))},
    'section-forecast-inner': ${JSON.stringify(extractSectionContent('section-forecast', sForecast))},
    'section-simulation-inner': ${JSON.stringify(extractSectionContent('section-simulation', sSim))},
    'section-outreach-inner': ${JSON.stringify(extractSectionContent('section-outreach', sOutreach))},
    'section-content-inner': ${JSON.stringify(extractSectionContent('section-content', sContent))},
    'section-objections-inner': ${JSON.stringify(extractSectionContent('section-objections', sObj))},
    'section-meetings-inner': ${JSON.stringify(extractSectionContent('section-meetings', sMeet))},
    'section-agents-inner': ${JSON.stringify(extractSectionContent('section-agents', sAgents))},
    'section-constraints-inner': ${JSON.stringify(extractSectionContent('section-constraints', sConst))},
    'section-auditlog-inner': ${JSON.stringify(extractSectionContent('section-auditlog', sAudit))},
  };
  Object.entries(map).forEach(([id, html]) => {
    const el = document.getElementById(id);
    if(el) el.innerHTML = html;
  });
  renderObjections(); renderMeetings(); renderCampaigns(); renderContent();
  renderAgents(); renderAuditLog(); renderConstraintsList(); renderForecast();
  initSimulationForm();
}

// ─── MINI CHARTS ON COMMAND PAGE ─────────────────────────
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

${mainJS}

// ─── PATCH renderCommand for new layout ──────────────────
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

</script>
</body>
</html>`;

// Helper to extract inner content of a section div
function extractSectionContent(id, fullHtml) {
  if(!fullHtml || fullHtml.includes('not found') || fullHtml.includes('extraction failed')) return '';
  // Strip the outer section div, return just the inner HTML
  const innerStart = fullHtml.indexOf('>') + 1;
  const innerEnd = fullHtml.lastIndexOf('</div>');
  return fullHtml.slice(innerStart, innerEnd).trim();
}

// Inline the extractSectionContent results into the JS map
// Re-build with actual content
const discovery_inner = extractSectionContent('section-discovery', sDisc);
const analytics_inner = extractSectionContent('section-analytics', sAnalytics);
const forecast_inner  = extractSectionContent('section-forecast', sForecast);
const sim_inner       = extractSectionContent('section-simulation', sSim);
const outreach_inner  = extractSectionContent('section-outreach', sOutreach);
const content_inner   = extractSectionContent('section-content', sContent);
const obj_inner       = extractSectionContent('section-objections', sObj);
const meet_inner      = extractSectionContent('section-meetings', sMeet);
const agents_inner    = extractSectionContent('section-agents', sAgents);
const const_inner     = extractSectionContent('section-constraints', sConst);
const audit_inner     = extractSectionContent('section-auditlog', sAudit);

const finalOut = out.replace(
  /\/\/ Inline the extractSectionContent[\s\S]*$/,
  ''
).replace(
  `'section-discovery-inner': \${JSON.stringify(extractSectionContent('section-discovery', sDisc))}`,
  `'section-discovery-inner': ${JSON.stringify(discovery_inner)}`
).replace(
  `'section-analytics-inner': \${JSON.stringify(extractSectionContent('section-analytics', sAnalytics))}`,
  `'section-analytics-inner': ${JSON.stringify(analytics_inner)}`
).replace(
  `'section-forecast-inner': \${JSON.stringify(extractSectionContent('section-forecast', sForecast))}`,
  `'section-forecast-inner': ${JSON.stringify(forecast_inner)}`
).replace(
  `'section-simulation-inner': \${JSON.stringify(extractSectionContent('section-simulation', sSim))}`,
  `'section-simulation-inner': ${JSON.stringify(sim_inner)}`
).replace(
  `'section-outreach-inner': \${JSON.stringify(extractSectionContent('section-outreach', sOutreach))}`,
  `'section-outreach-inner': ${JSON.stringify(outreach_inner)}`
).replace(
  `'section-content-inner': \${JSON.stringify(extractSectionContent('section-content', sContent))}`,
  `'section-content-inner': ${JSON.stringify(content_inner)}`
).replace(
  `'section-objections-inner': \${JSON.stringify(extractSectionContent('section-objections', sObj))}`,
  `'section-objections-inner': ${JSON.stringify(obj_inner)}`
).replace(
  `'section-meetings-inner': \${JSON.stringify(extractSectionContent('section-meetings', sMeet))}`,
  `'section-meetings-inner': ${JSON.stringify(meet_inner)}`
).replace(
  `'section-agents-inner': \${JSON.stringify(extractSectionContent('section-agents', sAgents))}`,
  `'section-agents-inner': ${JSON.stringify(agents_inner)}`
).replace(
  `'section-constraints-inner': \${JSON.stringify(extractSectionContent('section-constraints', sConst))}`,
  `'section-constraints-inner': ${JSON.stringify(const_inner)}`
).replace(
  `'section-auditlog-inner': \${JSON.stringify(extractSectionContent('section-auditlog', sAudit))}`,
  `'section-auditlog-inner': ${JSON.stringify(audit_inner)}`
);

fs.writeFileSync('index.html', finalOut);
console.log('✅ Rebuilt index.html — lines:', finalOut.split('\n').length);
