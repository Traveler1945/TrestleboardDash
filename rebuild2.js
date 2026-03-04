const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');

// ── Extract JS block ──────────────────────────────────────────────
function extractJS(src) {
  const datajsIdx = src.indexOf('<script src="data.js"></script>');
  const nextScript = src.indexOf('<script>', datajsIdx);
  const jsStart = nextScript + '<script>'.length;
  const jsEnd = src.lastIndexOf('</script>');
  return src.slice(jsStart, jsEnd);
}

// ── Extract modals ────────────────────────────────────────────────
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

// ── Extract auth gate ─────────────────────────────────────────────
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

const authGate = extractAuthGate(src);
const modals = extractModals(src);
const mainJS = extractJS(src);

const BUILD_TIME = new Date().toISOString();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<title>CLAWBOT // TRESTLEBOARD OPS</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
/* ── RESET ── */
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07080c;--surface:#0d0f18;--surface2:#141720;--surface3:#1a1e2a;
  --border:#1e2235;--border2:#252b3d;
  --accent:#f0c040;--accent2:#ffd966;--accentDim:#f0c04033;
  --danger:#ff3b3b;--dangerDim:#ff3b3b22;
  --warn:#ff9500;--warnDim:#ff950022;
  --success:#00d26a;--successDim:#00d26a22;
  --blue:#4a90ff;--blueDim:#4a90ff22;
  --hold:#a855f7;--holdDim:#a855f722;
  --text:#e8eaf0;--muted:#4a5068;--muted2:#6b7494;
  --radius:4px;
  --glow-accent: 0 0 20px #f0c04044, 0 0 40px #f0c04022;
  --glow-success: 0 0 20px #00d26a44, 0 0 40px #00d26a22;
  --glow-danger: 0 0 20px #ff3b3b44;
}

body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;font-size:13px;min-height:100vh;overflow-x:hidden}

/* ── AUTH ── */
#auth-gate{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:99999;flex-direction:column;gap:0;background-image:radial-gradient(ellipse at 50% 0%, #f0c04008 0%, transparent 70%)}
#auth-gate.hidden{display:none}
.auth-box{background:var(--surface);border:1px solid var(--accent);padding:48px 56px;width:420px;text-align:center;box-shadow:var(--glow-accent)}
.auth-logo{font-size:26px;letter-spacing:8px;color:var(--accent);font-weight:bold;margin-bottom:4px;text-shadow:var(--glow-accent)}
.auth-tagline{font-size:9px;color:var(--muted2);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px}
.auth-div{border-top:1px solid var(--border2);margin:24px 0}
.auth-box input[type="password"]{width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:14px;font-family:inherit;font-size:18px;text-align:center;letter-spacing:8px;margin-bottom:14px;border-radius:var(--radius)}
.auth-box input:focus{outline:1px solid var(--accent);box-shadow:var(--glow-accent)}
.auth-btn{width:100%;background:var(--accent);border:none;color:var(--bg);padding:14px;font-family:inherit;font-size:12px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;font-weight:bold;border-radius:var(--radius);transition:all .2s}
.auth-btn:hover{background:var(--accent2);box-shadow:var(--glow-accent)}
.auth-error{color:var(--danger);font-size:10px;margin-top:12px;min-height:16px;letter-spacing:1px}

/* ── BUILD BAR (Last Updated) ── */
#build-bar{background:#0a0b10;border-bottom:1px solid var(--border);padding:5px 20px;display:flex;align-items:center;justify-content:space-between;font-size:9px;color:var(--muted2);letter-spacing:1px;position:sticky;top:0;z-index:102}
#build-bar .bb-left{display:flex;gap:16px;align-items:center}
.bb-dot{width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block;box-shadow:0 0 8px var(--success);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
#build-bar .bb-right{color:var(--muted)}

/* ── TOPBAR ── */
.topbar{display:flex;align-items:center;justify-content:space-between;background:var(--surface);border-bottom:2px solid var(--border);padding:12px 20px;position:sticky;top:28px;z-index:101;gap:12px}
.logo{display:flex;flex-direction:column}
.logo-main{font-size:16px;font-weight:bold;color:var(--accent);letter-spacing:5px;text-shadow:0 0 12px #f0c04066}
.logo-sub{font-size:8px;color:var(--muted2);letter-spacing:2px;margin-top:2px}
.top-mode{display:flex;align-items:center;gap:6px}
.mode-label{font-size:8px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase}
.mode-btn{border:1px solid var(--border2);background:transparent;color:var(--muted2);padding:5px 12px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit;border-radius:var(--radius);transition:all .2s}
.mode-btn.manual.active{border-color:var(--blue);color:var(--blue);background:var(--blueDim);box-shadow:0 0 10px #4a90ff44}
.mode-btn.semi.active{border-color:var(--accent);color:var(--accent);background:var(--accentDim);box-shadow:0 0 10px #f0c04044}
.mode-btn.full.active{border-color:var(--success);color:var(--success);background:var(--successDim);box-shadow:0 0 10px #00d26a44}
.brief-btn{border-color:var(--accent);color:var(--accent);background:var(--accentDim)}
.top-right{display:flex;gap:10px;align-items:center;font-size:9px;color:var(--muted2)}

/* ── NAV (3 big pills) ── */
.main-nav{display:flex;background:var(--surface);border-bottom:1px solid var(--border);padding:0 20px;gap:0}
.nav-pill{background:transparent;border:none;border-bottom:3px solid transparent;color:var(--muted2);padding:14px 24px;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:3px;text-transform:uppercase;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:6px}
.nav-pill:hover{color:var(--text)}
.nav-pill.active{color:var(--accent);border-bottom-color:var(--accent)}
.nav-pill .nav-icon{font-size:14px}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;font-size:9px;border-radius:9px;background:var(--danger);color:#fff;font-weight:bold;animation:pulse 1.5s infinite}
.intel-alert-badge{background:var(--accent);color:var(--bg)}

/* ── PAGES ── */
.page{display:none;padding:0}
.page.active{display:block}

/* ── COMMAND PAGE ── */
.page-command{padding:0}

/* Intel waiting banner */
.intel-banner{display:none;background:linear-gradient(135deg,#1a1400,#0a0900);border-bottom:2px solid var(--accent);padding:14px 20px;cursor:pointer;transition:all .2s}
.intel-banner:hover{background:linear-gradient(135deg,#221a00,#120e00)}
.intel-banner.show{display:flex}
.intel-banner-inner{display:flex;align-items:center;gap:12px;width:100%}
.intel-banner-icon{font-size:20px;animation:pulse 1s infinite}
.intel-banner-text h3{font-size:12px;color:var(--accent);letter-spacing:2px;text-transform:uppercase;margin-bottom:2px}
.intel-banner-text p{font-size:10px;color:var(--muted2)}
.intel-banner-arrow{margin-left:auto;color:var(--accent);font-size:18px}

/* Mission stats */
.mission-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border)}
.stat-tile{background:var(--surface);padding:20px;text-align:center;position:relative;overflow:hidden;cursor:default;transition:background .2s}
.stat-tile:hover{background:var(--surface2)}
.stat-tile::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--muted)}
.stat-tile.ev::before{background:linear-gradient(90deg,var(--accent),var(--accent2))}
.stat-tile.active::before{background:var(--success)}
.stat-tile.risk::before{background:var(--warn)}
.stat-tile.intel::before{background:var(--hold)}
.stat-tile-val{font-size:32px;font-weight:bold;color:var(--text);line-height:1;margin-bottom:6px;font-family:'Courier New',monospace}
.stat-tile.ev .stat-tile-val{color:var(--accent)}
.stat-tile.active .stat-tile-val{color:var(--success)}
.stat-tile.risk .stat-tile-val{color:var(--warn)}
.stat-tile.intel .stat-tile-val{color:var(--hold)}
.stat-tile-label{font-size:8px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase}
.stat-tile-sub{font-size:9px;color:var(--muted);margin-top:4px}

/* Command body */
.cmd-body{display:grid;grid-template-columns:1fr 340px;gap:0;min-height:calc(100vh - 280px)}
.cmd-left{padding:20px;border-right:1px solid var(--border)}
.cmd-right{padding:20px;background:var(--surface)}
.section-label{font-size:9px;color:var(--muted2);letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;height:1px;background:var(--border)}

/* Priority stack */
.priority-card{background:var(--surface2);border:1px solid var(--border2);border-left:3px solid var(--muted);padding:12px 14px;margin-bottom:8px;border-radius:0 var(--radius) var(--radius) 0;cursor:pointer;transition:all .15s}
.priority-card:hover{border-color:var(--accent);background:var(--surface3)}
.priority-card.p-critical{border-left-color:var(--danger)}
.priority-card.p-high{border-left-color:var(--warn)}
.priority-card.p-med{border-left-color:var(--success)}
.priority-card-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.priority-card-name{font-size:13px;font-weight:bold;flex:1}
.priority-card-org{font-size:10px;color:var(--muted2);margin-bottom:4px}
.priority-card-nba{font-size:10px;color:var(--blue)}
.priority-card-badges{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:6px}

/* Empty state */
.empty-state{text-align:center;padding:40px 20px;color:var(--muted2)}
.empty-state-icon{font-size:48px;margin-bottom:12px;opacity:.5}
.empty-state h3{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2);margin-bottom:8px}
.empty-state p{font-size:11px;margin-bottom:20px;line-height:1.6}

/* Alert strip */
.alert-strip{background:var(--warnDim);border:1px solid var(--warn);border-left:4px solid var(--warn);padding:10px 14px;margin-bottom:8px;font-size:11px;color:var(--warn);display:flex;justify-content:space-between;align-items:center;border-radius:0 var(--radius) var(--radius) 0}
.alert-strip.danger{background:var(--dangerDim);border-color:var(--danger);color:var(--danger)}

/* ── PIPELINE PAGE ── */
.pipeline-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
.pipeline-sub{display:flex;gap:4px}
.sub-pill{background:transparent;border:1px solid var(--border2);color:var(--muted2);padding:6px 16px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:2px;text-transform:uppercase;border-radius:var(--radius);transition:all .2s}
.sub-pill.active{background:var(--accentDim);border-color:var(--accent);color:var(--accent)}
.pipeline-view{display:none;padding:20px}
.pipeline-view.active{display:block}

/* ── INTEL PAGE ── */
.intel-header{padding:20px;border-bottom:1px solid var(--border)}
.intel-header h2{font-size:11px;letter-spacing:3px;color:var(--accent);text-transform:uppercase}
.accordion{display:flex;flex-direction:column;gap:2px}
.accordion-header{display:flex;justify-content:space-between;align-items:center;background:var(--surface);padding:14px 20px;cursor:pointer;border-left:3px solid transparent;user-select:none;transition:all .15s}
.accordion-header:hover{background:var(--surface2)}
.accordion-header.open{border-left-color:var(--accent);background:var(--surface2)}
.accordion-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2)}
.accordion-header.open .accordion-title{color:var(--accent)}
.accordion-chevron{font-size:10px;color:var(--muted);transition:transform .2s}
.accordion-header.open .accordion-chevron{transform:rotate(180deg);color:var(--accent)}
.accordion-body{display:none;padding:20px;background:var(--surface2);border-left:3px solid var(--accent)}

/* ── LEAD DISCOVERY CARDS (hero) ── */
.intel-count-bar{background:var(--accentDim);border:1px solid var(--accent);padding:10px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px;border-radius:var(--radius)}
.intel-count-num{font-size:24px;font-weight:bold;color:var(--accent)}
.intel-count-label{font-size:10px;color:var(--muted2);letter-spacing:1px}

.lead-card{background:var(--surface);border:1px solid var(--border2);margin-bottom:10px;border-radius:var(--radius);overflow:hidden;transition:border-color .15s}
.lead-card:hover{border-color:var(--accent)}
.lead-card-header{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer}
.lead-card-conf{min-width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid}
.conf-high{background:var(--successDim);border-color:var(--success);color:var(--success)}
.conf-med{background:var(--warnDim);border-color:var(--warn);color:var(--warn)}
.conf-low{background:var(--surface2);border-color:var(--border2);color:var(--muted2)}
.lead-card-info{flex:1;min-width:0}
.lead-card-name{font-size:14px;font-weight:bold;margin-bottom:2px}
.lead-card-title{font-size:10px;color:var(--muted2);margin-bottom:4px}
.lead-card-org{font-size:11px;color:var(--accent);margin-bottom:2px}
.lead-card-loc{font-size:9px;color:var(--muted2)}
.lead-card-actions{display:flex;flex-direction:column;gap:4px;align-items:flex-end}
.lead-card-body{display:none;padding:0 16px 14px;border-top:1px solid var(--border)}
.lead-card-body.open{display:block}
.lead-intel-box{background:var(--surface2);padding:12px;border-radius:var(--radius);font-size:11px;color:#bcc0cc;line-height:1.7;margin:10px 0;white-space:pre-wrap}
.lead-card-bottom{display:flex;gap:6px;flex-wrap:wrap;padding-top:8px}

/* ── BUTTONS ── */
.btn{background:none;border:1px solid var(--border2);color:var(--text);padding:7px 16px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1px;text-transform:uppercase;transition:all .2s;border-radius:var(--radius);white-space:nowrap}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn.primary{border-color:var(--accent);color:var(--accent);background:var(--accentDim)}
.btn.primary:hover{background:var(--accent);color:var(--bg)}
.btn.success{border-color:var(--success);color:var(--success);background:var(--successDim)}
.btn.success:hover{background:var(--success);color:var(--bg)}
.btn.danger{border-color:var(--danger);color:var(--danger)}
.btn.danger:hover{background:var(--danger);color:#fff}
.btn.warn{border-color:var(--warn);color:var(--warn)}
.btn.sm{padding:4px 10px;font-size:9px}
.btn.xs{padding:2px 7px;font-size:9px;letter-spacing:0;text-transform:none}
.btn.link{border:none;background:none;color:var(--muted2);padding:2px 4px;font-size:9px}
.btn.link:hover{color:var(--accent);border:none}

/* Pipeline start button */
.btn-pipeline{background:linear-gradient(135deg,var(--success),#00a855);border:none;color:var(--bg);padding:8px 18px;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;cursor:pointer;border-radius:var(--radius);font-family:inherit;transition:all .2s;box-shadow:0 0 16px #00d26a44;display:flex;align-items:center;gap:6px}
.btn-pipeline:hover{box-shadow:var(--glow-success);transform:translateY(-1px)}
.btn-pipeline.locked{background:var(--surface2);border:1px solid var(--border2);color:var(--muted2);box-shadow:none;cursor:not-allowed}
.btn-pipeline.locked:hover{transform:none;box-shadow:none}

/* ── FAB ── */
.fab{position:fixed;bottom:24px;right:24px;background:var(--accent);color:var(--bg);border:none;width:52px;height:52px;border-radius:50%;font-size:24px;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:var(--glow-accent);z-index:200;font-weight:bold;transition:all .2s}
.fab.visible{display:flex}
.fab:hover{background:var(--accent2);transform:scale(1.1)}

/* ── KANBAN ── */
.kanban{display:flex;gap:8px;overflow-x:auto;padding-bottom:12px}
.kanban-col{min-width:170px;flex:1;background:var(--surface);border:1px solid var(--border);border-top:2px solid var(--muted);border-radius:var(--radius)}
.kanban-col-header{padding:10px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.kanban-col-title{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2)}
.kanban-col-count{font-size:9px;color:var(--muted)}
.kanban-col-body{padding:6px;min-height:80px}
.kanban-card{background:var(--surface2);border-left:3px solid var(--muted);padding:10px;margin-bottom:6px;cursor:grab;transition:all .15s;border-radius:0 var(--radius) var(--radius) 0}
.kanban-card:hover{border-left-color:var(--accent)}
.kanban-card.dragging{opacity:.3}
.kanban-card.decay-hot{border-left-color:var(--danger)}
.kanban-card.decay-warn{border-left-color:var(--warn)}
.kanban-card.decay-ok{border-left-color:var(--success)}
.kanban-col.drag-over{background:var(--accentDim);border-color:var(--accent)}
.card-name{font-size:12px;margin-bottom:2px;font-weight:bold}
.card-org{font-size:9px;color:var(--muted2);margin-bottom:6px}
.card-score-bar{height:2px;background:var(--border);margin-bottom:4px;border-radius:1px;overflow:hidden}
.card-score-fill{height:100%}
.card-score-label{font-size:9px;color:var(--muted2);margin-bottom:4px}
.card-actions{display:flex;gap:3px;flex-wrap:wrap}

/* ── TABLES ── */
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:8px 12px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2);border-bottom:1px solid var(--border)}
td{padding:9px 12px;border-bottom:1px solid var(--border);vertical-align:middle;font-size:11px}
tr:hover td{background:var(--surface2)}

/* ── BADGES / TAGS ── */
.tag{display:inline-block;padding:2px 7px;font-size:9px;letter-spacing:1px;text-transform:uppercase;border:1px solid;border-radius:var(--radius)}
.tag.amber{background:var(--accentDim);border-color:var(--accent);color:var(--accent)}
.tag.green{background:var(--successDim);border-color:var(--success);color:var(--success)}
.tag.red{background:var(--dangerDim);border-color:var(--danger);color:var(--danger)}
.tag.blue{background:var(--blueDim);border-color:var(--blue);color:var(--blue)}
.tag.gray{background:var(--surface2);border-color:var(--border2);color:var(--muted2)}
.tag.purple{background:var(--holdDim);border-color:var(--hold);color:var(--hold)}
.tag.warn{background:var(--warnDim);border-color:var(--warn);color:var(--warn)}

.score-badge{display:inline-flex;align-items:center;justify-content:center;width:34px;height:22px;font-size:10px;font-weight:bold;border:1px solid;border-radius:var(--radius)}
.score-hot{background:var(--dangerDim);border-color:var(--danger);color:#ff8080}
.score-warm{background:var(--warnDim);border-color:var(--warn);color:#ffb347}
.score-cool{background:var(--successDim);border-color:var(--success);color:#66cc88}
.score-cold{background:var(--surface2);border-color:var(--border2);color:var(--muted2)}

.priority-badge{padding:2px 8px;border:1px solid;font-size:9px;letter-spacing:1px;text-transform:uppercase;border-radius:var(--radius)}
.priority-critical{background:var(--dangerDim);border-color:var(--danger);color:var(--danger)}
.priority-high{background:var(--warnDim);border-color:var(--warn);color:var(--warn)}
.priority-med{background:var(--successDim);border-color:var(--success);color:var(--success)}
.priority-low{background:var(--surface2);border-color:var(--border2);color:var(--muted2)}

.hold-badge{background:var(--holdDim);border:1px solid var(--hold);color:var(--hold);padding:2px 7px;font-size:9px;letter-spacing:1px;border-radius:var(--radius)}
.decay-indicator{font-size:9px;letter-spacing:1px}
.decay-hot{color:var(--danger)}
.decay-warn{color:var(--warn)}
.decay-ok{color:var(--success)}

/* ── FORMS ── */
.form-group{margin-bottom:12px}
label{display:block;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--muted2);margin-bottom:4px}
input,textarea,select{width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:8px 10px;font-family:inherit;font-size:12px;border-radius:var(--radius)}
input:focus,textarea:focus,select:focus{outline:1px solid var(--accent)}
textarea{resize:vertical;min-height:70px}
select{cursor:pointer}

/* ── STAT CARDS (pipeline inner) ── */
.stats-row{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.stat-card{background:var(--surface);border:1px solid var(--border);border-top:2px solid var(--accent);padding:14px 16px;flex:1;min-width:100px;border-radius:var(--radius)}
.stat-card.warn{border-top-color:var(--warn)}
.stat-card.danger{border-top-color:var(--danger)}
.stat-card.success{border-top-color:var(--success)}
.stat-value{font-size:22px;color:var(--accent);font-weight:bold}
.stat-card.warn .stat-value{color:var(--warn)}
.stat-card.danger .stat-value{color:var(--danger)}
.stat-card.success .stat-value{color:var(--success)}
.stat-label{font-size:9px;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-top:4px}
.stat-sub{font-size:9px;color:var(--muted);margin-top:2px}

/* ── SECTION HEADER ── */
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.section-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--accent)}
.section-actions{display:flex;gap:6px;flex-wrap:wrap}

/* ── MISC ── */
.info-panel{background:var(--blueDim);border:1px solid var(--blue);border-left:4px solid var(--blue);padding:10px 14px;color:#9ec5ff;font-size:11px;margin-bottom:12px;border-radius:0 var(--radius) var(--radius) 0}
.info-panel strong{color:#fff}
.forecast-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px}
.forecast-card{background:var(--surface);border:1px solid var(--border);padding:16px;text-align:center;border-radius:var(--radius)}
.forecast-card.conservative{border-top:2px solid var(--muted)}
.forecast-card.base{border-top:2px solid var(--accent)}
.forecast-card.upside{border-top:2px solid var(--success)}
.forecast-val{font-size:22px;font-weight:bold;color:var(--accent)}
.forecast-card.conservative .forecast-val{color:var(--muted2)}
.forecast-card.upside .forecast-val{color:var(--success)}
.forecast-label{font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-top:4px}
.forecast-desc{font-size:10px;color:var(--muted2);margin-top:6px}
.pipeline-row{display:flex;gap:8px;margin-bottom:8px}
.pipeline-stage-label{font-size:9px;color:var(--muted2);width:110px;flex-shrink:0;padding-top:5px;letter-spacing:1px}
.pipeline-bar-wrap{flex:1;background:var(--surface2);height:24px;position:relative;border:1px solid var(--border)}
.pipeline-bar-fill{height:100%;background:var(--accent);opacity:.6;transition:width .4s}
.pipeline-bar-label{position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:9px;color:var(--text)}
.pipeline-ev{width:80px;text-align:right;font-size:10px;color:var(--accent);padding-top:4px}
.obj-card{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--warn);padding:12px 14px;margin-bottom:8px;border-radius:0 var(--radius) var(--radius) 0}
.obj-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.obj-type{font-size:11px;color:var(--warn);letter-spacing:1px}
.obj-vertical{font-size:9px;color:var(--muted2)}
.obj-counter{font-size:10px;color:#aaa;margin-bottom:6px;line-height:1.5}
.sequence-card{background:var(--surface);border:1px solid var(--border);padding:14px;margin-bottom:8px;border-radius:var(--radius)}
.sequence-header{display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.sequence-title{font-size:12px;margin-bottom:2px;font-weight:bold}
.sequence-meta{font-size:10px;color:var(--muted2)}
.sequence-steps{display:flex;gap:0;margin-bottom:10px}
.step{flex:1;padding:6px 4px;border:1px solid var(--border);font-size:9px;text-align:center;color:var(--muted2);background:var(--surface2)}
.step.done{border-color:var(--success);color:var(--success);background:var(--successDim)}
.step.active{border-color:var(--accent);color:var(--accent);background:var(--accentDim)}
.sequence-actions{display:flex;gap:5px;flex-wrap:wrap}
.queue-card{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);padding:14px;margin-bottom:8px;border-radius:0 var(--radius) var(--radius) 0}
.queue-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.queue-card-title{font-size:12px;margin-bottom:2px;font-weight:bold}
.queue-card-meta{font-size:10px;color:var(--muted2)}
.queue-card-body{font-size:11px;color:#999;margin-bottom:8px;line-height:1.5}
.queue-card-actions{display:flex;gap:5px;flex-wrap:wrap}
.meeting-card{background:var(--surface);border:1px solid var(--border);padding:14px;margin-bottom:8px;border-radius:var(--radius)}
.meeting-header{display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.log-entry{display:flex;gap:12px;padding:6px 0;border-bottom:1px solid var(--border);font-size:10px}
.log-time{color:var(--muted2);white-space:nowrap;min-width:130px}
.log-actor{color:var(--accent);min-width:70px}
.log-action{color:var(--text)}
.dossier{background:var(--surface2);border:1px solid var(--border);padding:14px;font-size:12px;line-height:1.8;border-radius:var(--radius)}
.dossier h4{color:var(--accent);letter-spacing:1px;text-transform:uppercase;font-size:10px;margin:12px 0 4px;border-bottom:1px solid var(--border);padding-bottom:3px}
.dossier p{color:#aaa}
.score-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.score-row{background:var(--surface2);border:1px solid var(--border);padding:6px 10px;border-radius:var(--radius)}
.score-row-label{font-size:9px;color:var(--muted2);letter-spacing:1px}
.score-row-val{font-size:13px;color:var(--accent);font-weight:bold;margin-top:2px}
.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:16px}
.agent-card{background:var(--surface);border:1px solid var(--border);border-top:2px solid var(--accent);padding:12px 14px;display:flex;flex-direction:column;gap:6px;border-radius:var(--radius)}
.agent-card h4{font-size:11px;color:var(--accent);letter-spacing:1px;text-transform:uppercase}
.agent-card p{font-size:10px;color:var(--muted2);line-height:1.4}
.agent-card .agent-meta{display:flex;justify-content:space-between;font-size:9px;color:var(--muted2)}
.agent-conflict{background:var(--dangerDim);border:1px solid var(--danger);color:var(--danger);padding:2px 6px;font-size:9px;letter-spacing:1px;border-radius:var(--radius)}
.conflict-list{display:flex;flex-direction:column;gap:8px}
.conflict-item{background:var(--surface);border:1px solid var(--border);padding:10px 12px;border-radius:var(--radius)}
.conflict-item h5{font-size:10px;color:var(--accent);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.conflict-item p{font-size:10px;color:#aaa;margin-bottom:4px}
.conflict-status{font-size:9px;letter-spacing:1px;text-transform:uppercase}
.conflict-status.pending{color:var(--warn)}
.conflict-status.resolved{color:var(--success)}
.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sim-card{background:var(--surface);border:1px solid var(--border);padding:14px;border-radius:var(--radius)}
.sim-card h4{font-size:10px;letter-spacing:2px;color:var(--accent);text-transform:uppercase;margin-bottom:8px}
.sim-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sim-output{margin-top:12px;background:var(--surface2);border:1px solid var(--border);padding:12px;font-size:11px;line-height:1.6;color:#cfd6ff;min-height:100px;white-space:pre-wrap;border-radius:var(--radius)}
.constraints-panel{background:var(--surface);border:1px solid var(--border);padding:16px;margin-bottom:12px;border-radius:var(--radius)}
.constraints-panel h4{font-size:10px;color:var(--accent);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
.constraints-panel ol{padding-left:16px;font-size:11px;line-height:1.6;color:#ccc}
.constraints-panel li{margin-bottom:4px}
.constraints-subgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.constraints-subgrid div{background:var(--surface2);border:1px solid var(--border);padding:10px;font-size:10px;line-height:1.5;border-radius:var(--radius)}
.constraints-subgrid strong{color:var(--accent);display:block;margin-bottom:3px;letter-spacing:1px}
.disc-log{background:var(--bg);border:1px solid var(--border);padding:10px;font-size:10px;max-height:180px;overflow-y:auto;margin-top:12px;color:var(--muted2);border-radius:var(--radius)}
.discovery-toggle{display:flex;gap:6px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
.disc-mode-btn{border:1px solid var(--border2);background:transparent;color:var(--muted2);padding:5px 12px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit;border-radius:var(--radius)}
.disc-mode-btn.active-OFF{border-color:var(--muted2);color:var(--muted2)}
.disc-mode-btn.active-SEARCHING{border-color:var(--success);color:var(--success);background:var(--successDim)}
.disc-mode-btn.active-PAUSED{border-color:var(--warn);color:var(--warn);background:var(--warnDim)}
.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chart-card{background:var(--surface);border:1px solid var(--border);padding:16px;border-radius:var(--radius)}
.chart-card-title{font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.chart-card.full{grid-column:span 2}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;align-items:center;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--accent);width:540px;max-width:95vw;max-height:90vh;overflow-y:auto;border-radius:var(--radius);box-shadow:var(--glow-accent)}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border)}
.modal-title{color:var(--accent);letter-spacing:2px;text-transform:uppercase;font-size:11px}
.modal-close{background:none;border:none;color:var(--muted2);cursor:pointer;font-size:18px}
.modal-body{padding:18px}
.modal-footer{padding:12px 18px;border-top:1px solid var(--border);display:flex;gap:6px;justify-content:flex-end}
#toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--accent);color:var(--accent);padding:10px 20px;font-size:11px;letter-spacing:1px;z-index:9999;display:none;border-radius:var(--radius);box-shadow:var(--glow-accent)}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border2)}
::-webkit-scrollbar-thumb:hover{background:var(--muted)}

@media(max-width:768px){
  .mission-stats{grid-template-columns:1fr 1fr}
  .cmd-body{grid-template-columns:1fr}
  .cmd-right{border-top:1px solid var(--border)}
  .chart-grid{grid-template-columns:1fr}
  .chart-card.full{grid-column:span 1}
  .forecast-grid{grid-template-columns:1fr}
  .sim-grid{grid-template-columns:1fr}
  .top-mode{display:none}
}
</style>
</head>
<body>

${authGate}

<!-- BUILD BAR -->
<div id="build-bar">
  <div class="bb-left">
    <span><span class="bb-dot"></span></span>
    <span>CLAWBOT TRESTLEBOARD OPS</span>
    <span>BUILD: <strong id="build-ver">v2.3</strong></span>
    <span>LAST UPDATED: <strong id="build-ts">—</strong></span>
  </div>
  <div class="bb-right" id="current-time"></div>
</div>

<!-- TOPBAR -->
<div class="topbar">
  <div class="logo">
    <div class="logo-main">CLAWBOT</div>
    <div class="logo-sub">TRESTLEBOARD GROUP LLC // REVENUE OPS</div>
  </div>
  <div class="top-mode">
    <span class="mode-label">Mode</span>
    <div id="mode-selector">
      <button class="mode-btn manual" data-mode="MANUAL" onclick="setAutonomyMode('MANUAL')">Manual</button>
      <button class="mode-btn semi" data-mode="SEMI-AUTO" onclick="setAutonomyMode('SEMI-AUTO')">Semi</button>
      <button class="mode-btn full" data-mode="FULL AUTO" onclick="setAutonomyMode('FULL AUTO')">Full</button>
    </div>
    <button class="btn sm brief-btn" onclick="openStrategicBrief()">📋 Brief</button>
  </div>
</div>

<!-- MAIN NAV -->
<div class="main-nav">
  <button class="nav-pill active" onclick="showPage('command',this)">
    <span class="nav-icon">🎯</span> Command
  </button>
  <button class="nav-pill" onclick="showPage('pipeline',this)">
    <span class="nav-icon">📊</span> Pipeline
  </button>
  <button class="nav-pill" onclick="showPage('intel',this)">
    <span class="nav-icon">🔍</span> Intel
    <span class="badge intel-alert-badge" id="nav-intel-badge" style="display:none">!</span>
  </button>
</div>

<!-- ═══════════════════════════════════════════ PAGE 1: COMMAND -->
<div class="page active" id="page-command">

  <!-- Intel waiting banner (shows when discovery queue has items) -->
  <div class="intel-banner" id="intel-banner" onclick="showPage('intel',document.querySelector('.nav-pill:nth-child(3)'));setTimeout(()=>{const h=document.querySelector('.accordion-header');if(h&&!h.classList.contains('open'))h.click();},100)">
    <div class="intel-banner-inner">
      <span class="intel-banner-icon">📡</span>
      <div class="intel-banner-text">
        <h3>Agent Intel Ready</h3>
        <p id="intel-banner-msg">Leads discovered — tap to review in Intel</p>
      </div>
      <span class="intel-banner-arrow">→</span>
    </div>
  </div>

  <!-- Alert container -->
  <div id="alert-container" style="padding:0 0 0 0"></div>

  <!-- Mission stats (4 big tiles) -->
  <div class="mission-stats">
    <div class="stat-tile ev">
      <div class="stat-tile-val" id="tm-pipeline">$0</div>
      <div class="stat-tile-label">Pipeline Value</div>
      <div class="stat-tile-sub">Expected Revenue</div>
    </div>
    <div class="stat-tile active">
      <div class="stat-tile-val" id="cmd-active">0</div>
      <div class="stat-tile-label">Active Leads</div>
      <div class="stat-tile-sub" id="cmd-total-sub">0 total in system</div>
    </div>
    <div class="stat-tile risk">
      <div class="stat-tile-val" id="cmd-decay">0</div>
      <div class="stat-tile-label">Need Attention</div>
      <div class="stat-tile-sub">Gone cold / stale</div>
    </div>
    <div class="stat-tile intel">
      <div class="stat-tile-val" id="cmd-intel-count">0</div>
      <div class="stat-tile-label">Intel Waiting</div>
      <div class="stat-tile-sub">Leads to review</div>
    </div>
  </div>

  <!-- Command body -->
  <div class="cmd-body">
    <div class="cmd-left">
      <div class="section-label">🎯 Priority Targets — What to do next</div>
      <div id="cmd-hot-leads">
        <div class="empty-state">
          <div class="empty-state-icon">🚀</div>
          <h3>No leads in pipeline yet</h3>
          <p>Check your Intel tab — you have agent-discovered contacts waiting for review. Import them to get started.</p>
          <button class="btn primary" onclick="showPage('intel',document.querySelector('.nav-pill:nth-child(3)'))">View Intel → Review Leads</button>
        </div>
      </div>
    </div>
    <div class="cmd-right">
      <div class="section-label">📈 Pipeline Overview</div>
      <div class="cmd-chart-card" style="background:var(--surface2);padding:14px;border-radius:4px;margin-bottom:14px">
        <div style="font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">By Stage</div>
        <canvas id="mini-funnel-chart" height="120"></canvas>
      </div>
      <div class="cmd-chart-card" style="background:var(--surface2);padding:14px;border-radius:4px">
        <div style="font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Lead Health</div>
        <canvas id="mini-decay-chart" height="90"></canvas>
      </div>
      <div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:4px;font-size:9px;color:var(--muted2);line-height:1.6" id="constraint-reminder">
        MODE: <span id="mode-display" style="color:var(--accent)">SEMI-AUTO</span> · Hard constraints active · Contact wall enabled
      </div>
    </div>
  </div>

  <!-- hidden legacy IDs -->
  <span id="cmd-stale" style="display:none"></span>
  <span id="cmd-briefings" style="display:none"></span>
  <span id="cmd-closed" style="display:none"></span>
  <span id="tm-leads" style="display:none"></span>
  <span id="tm-decay" style="display:none"></span>
  <span id="cmd-total" style="display:none"></span>
  <div id="hold-info"></div>
  <div id="cmd-forecast-mini" style="display:none"></div>
  <div id="cmd-objections-mini" style="display:none"></div>
  <div id="constraints-banner" style="display:none"></div>
</div>

<!-- ═══════════════════════════════════════════ PAGE 2: PIPELINE -->
<div class="page" id="page-pipeline">
  <div class="pipeline-header">
    <div class="pipeline-sub">
      <button class="sub-pill active" onclick="showPipelineView('kanban',this)">🗂 Kanban Board</button>
      <button class="sub-pill" onclick="showPipelineView('table',this)">📋 List View</button>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn sm" onclick="exportLeads()">Export CSV</button>
      <button class="btn sm primary" onclick="openAddLead()">+ Add Lead</button>
    </div>
  </div>

  <div class="pipeline-view active" id="pview-kanban">
    <div class="kanban" id="kanban-board"></div>
  </div>

  <div class="pipeline-view" id="pview-table">
    <div style="padding:0">
      <table>
        <thead><tr>
          <th>Score</th><th>Name</th><th>Organization</th><th>Vertical</th>
          <th>Stage</th><th>Decay</th><th>Priority</th><th>Next Action</th><th>Profile</th><th>Value</th><th>Contact</th><th>Actions</th>
        </tr></thead>
        <tbody id="lead-tbody"></tbody>
      </table>
    </div>
  </div>

  <button class="fab visible" id="fab-add" onclick="openAddLead()">+</button>
</div>

<!-- ═══════════════════════════════════════════ PAGE 3: INTEL -->
<div class="page" id="page-intel">
  <div class="accordion">

    <!-- Discovery (open by default) -->
    <div class="accordion-header open" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">📡 Agent Discovery — Verified Contacts</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body" style="display:block">
      <div id="discovery-hero"></div>
    </div>

    <!-- Analytics -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">📈 Analytics & Charts</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-analytics-inner"></div>
    </div>

    <!-- Forecast -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">💰 Revenue Forecast</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-forecast-inner"></div>
    </div>

    <!-- Simulation -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">⚡ Simulation Engine</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-simulation-inner"></div>
    </div>

    <!-- Campaigns -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">📨 Campaign Orchestration</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-outreach-inner"></div>
    </div>

    <!-- Content -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">📝 Content Queue</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-content-inner"></div>
    </div>

    <!-- Objections -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">🛡 Objection Registry</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-objections-inner"></div>
    </div>

    <!-- Meetings -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">📅 Briefings & Meetings</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-meetings-inner"></div>
    </div>

    <!-- Agents -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">🤖 Agent Mesh</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-agents-inner"></div>
    </div>

    <!-- Constraints -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">🔒 Rules & Constraints</span>
      <span class="accordion-chevron">▲</span>
    </div>
    <div class="accordion-body">
      <div id="section-constraints-inner"></div>
    </div>

    <!-- Audit Log -->
    <div class="accordion-header" onclick="toggleIntelPanel(this)">
      <span class="accordion-title">📋 Audit Log</span>
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
// ─── NAVIGATION ────────────────────────────────────────────
function showPage(pageId, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if(page) page.classList.add('active');
  document.querySelectorAll('.main-nav .nav-pill').forEach(n => n.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const fab = document.getElementById('fab-add');
  if(fab) fab.classList.toggle('visible', pageId === 'pipeline');
  if(pageId === 'pipeline') { renderKanban(); renderLeadTable(); }
  if(pageId === 'intel') { mountIntelSections(); renderAnalytics(); renderDiscoveryHero(); }
  if(pageId === 'command') { renderCommandCharts(); updateIntelBanner(); }
}
function showPipelineView(view, btn) {
  document.querySelectorAll('.pipeline-view').forEach(v => v.classList.remove('active'));
  const viewEl = document.getElementById('pview-' + view);
  if(viewEl) viewEl.classList.add('active');
  document.querySelectorAll('.pipeline-sub .sub-pill').forEach(el => el.classList.remove('active'));
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
function showSection(id, btn) {} // legacy shim

// ─── INTEL BANNER ─────────────────────────────────────────
function updateIntelBanner() {
  const queue = state.discoveryQueue || [];
  const banner = document.getElementById('intel-banner');
  const badge = document.getElementById('nav-intel-badge');
  const countEl = document.getElementById('cmd-intel-count');
  const msg = document.getElementById('intel-banner-msg');
  if(queue.length > 0) {
    if(banner) { banner.classList.add('show'); }
    if(badge) { badge.style.display = 'inline-flex'; badge.textContent = queue.length; }
    if(countEl) countEl.textContent = queue.length;
    if(msg) msg.textContent = queue.length + ' verified contacts ready — tap to review';
  } else {
    if(banner) banner.classList.remove('show');
    if(badge) badge.style.display = 'none';
    if(countEl) countEl.textContent = '0';
  }
}

// ─── DISCOVERY HERO (new card-based view) ─────────────────
let _intelMounted = false;
function mountIntelSections() {
  if(_intelMounted) return;
  _intelMounted = true;
  const map = {
    'section-analytics-inner': '',
    'section-forecast-inner': '<div class="section-header"><div class="section-title">Revenue Forecast</div><div class="section-actions"><button class="btn sm" onclick="renderForecast()">Recalculate</button></div></div><div class="forecast-grid"><div class="forecast-card conservative"><div class="forecast-val" id="fc-conservative">$0</div><div class="forecast-label">Conservative</div><div class="forecast-desc">P(close) \xd7 0.7</div></div><div class="forecast-card base"><div class="forecast-val" id="fc-base">$0</div><div class="forecast-label">Base Case</div><div class="forecast-desc">Probability-weighted EV</div></div><div class="forecast-card upside"><div class="forecast-val" id="fc-upside">$0</div><div class="forecast-label">Upside</div><div class="forecast-desc">P(close) \xd7 1.3</div></div></div><div id="pipeline-bars"></div><table><thead><tr><th>Lead</th><th>Stage</th><th>Score</th><th>Value</th><th>P(Close)</th><th>Mult</th><th>EV</th></tr></thead><tbody id="forecast-tbody"></tbody></table>',
    'section-simulation-inner': '',
    'section-outreach-inner': '',
    'section-content-inner': '',
    'section-objections-inner': '',
    'section-meetings-inner': '',
    'section-agents-inner': '',
    'section-constraints-inner': '',
    'section-auditlog-inner': '<div style="font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Recent Activity</div><div id="audit-log-container"></div>',
  };
  Object.entries(map).forEach(([id, html]) => {
    const el = document.getElementById(id);
    if(el && html) el.innerHTML = html;
  });
  renderObjections(); renderMeetings(); renderCampaigns(); renderContent();
  renderAgents(); renderAuditLog(); renderConstraintsList(); renderForecast();
  initSimulationForm(); renderAnalytics();
}

function getForecastHTML(){
  return '<div class="section-header"><div class="section-title">Revenue Forecast</div><div class="section-actions"><button class="btn sm" onclick="renderForecast()">Recalculate</button></div></div><div class="forecast-grid"><div class="forecast-card conservative"><div class="forecast-val" id="fc-conservative">$0</div><div class="forecast-label">Conservative</div><div class="forecast-desc">P(close) × 0.7</div></div><div class="forecast-card base"><div class="forecast-val" id="fc-base">$0</div><div class="forecast-label">Base Case</div><div class="forecast-desc">Probability-weighted EV</div></div><div class="forecast-card upside"><div class="forecast-val" id="fc-upside">$0</div><div class="forecast-label">Upside</div><div class="forecast-desc">P(close) × 1.3</div></div></div><div id="pipeline-bars"></div><table><thead><tr><th>Lead</th><th>Stage</th><th>Score</th><th>Value</th><th>P(Close)</th><th>Mult</th><th>EV</th></tr></thead><tbody id="forecast-tbody"></tbody></table>';
}

function renderDiscoveryHero() {
  const el = document.getElementById('discovery-hero');
  if(!el) return;
  const queue = state.discoveryQueue || [];
  
  if(!queue.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No intel yet</h3><p>Run a discovery scan to populate this queue.</p><button class="btn primary" onclick="runDiscoveryScan()">Run Scan</button></div>';
    return;
  }

  // Group by vertical
  const verticals = {};
  queue.forEach(item => {
    const v = item.vertical || 'Other';
    if(!verticals[v]) verticals[v] = [];
    verticals[v].push(item);
  });

  // Mode toggles + count
  let html = \`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div class="intel-count-bar" style="flex:1;min-width:200px">
      <span class="intel-count-num">\${queue.length}</span>
      <span class="intel-count-label">VERIFIED CONTACTS IN QUEUE · TAP ANY CARD TO EXPAND</span>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn sm" onclick="resetAndReloadAllLeads()">↻ Reload All Intel</button>
    </div>
  </div>
  <div style="margin-bottom:12px;font-size:9px;color:var(--muted2);display:flex;gap:6px;flex-wrap:wrap">
    <span style="color:var(--success)">● High confidence ≥85%</span>
    <span style="color:var(--warn)">● Medium 70–84%</span>
    <span style="color:var(--muted2)">● Lower &lt;70%</span>
  </div>\`;

  Object.entries(verticals).forEach(([vertical, items]) => {
    html += \`<div style="margin-bottom:6px;font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;padding:6px 0;border-bottom:1px solid var(--border)">\${vertical} (\${items.length})</div>\`;
    items.forEach(item => {
      const confClass = item.confidence >= 85 ? 'conf-high' : item.confidence >= 70 ? 'conf-med' : 'conf-low';
      const intelLines = (item.intel || '').split('\\n');
      const firstLine = intelLines[0] || '';
      const emailLine = intelLines.find(l => l.includes('Email')) || '';
      const linkedinLine = intelLines.find(l => l.includes('LinkedIn') || l.includes('linkedin')) || '';
      const locationLine = intelLines.find(l => l.includes('Location') || l.includes('City')) || '';
      const approachLine = intelLines.find(l => l.includes('Approach')) || '';
      const contractLine = intelLines.find(l => l.includes('Contract')) || '';
      
      // Extract email value
      const emailMatch = emailLine.match(/:\\s*(.+)/);
      const emailVal = emailMatch ? emailMatch[1].trim() : '';
      const linkedinMatch = linkedinLine.match(/:\\s*(.+)/i) || linkedinLine.match(/(linkedin\\.com\\/in\\/[^\\s]+)/i);
      const linkedinVal = linkedinMatch ? linkedinMatch[1].trim() : '';

      html += \`<div class="lead-card" id="card-\${item.id}">
        <div class="lead-card-header" onclick="toggleLeadCard('\${item.id}')">
          <div class="lead-card-conf \${confClass}">\${item.confidence}%</div>
          <div class="lead-card-info">
            <div class="lead-card-name">\${item.name || 'Unknown'}</div>
            <div class="lead-card-title">\${firstLine.substring(0, 80)}</div>
            <div class="lead-card-org">\${item.org || '—'}</div>
            \${item.location ? \`<div class="lead-card-loc">📍 \${item.location}</div>\` : ''}
          </div>
          <div class="lead-card-actions">
            \${emailVal && !emailVal.includes('verify') ? \`<a href="mailto:\${emailVal.split(' ')[0]}" class="btn xs primary" onclick="event.stopPropagation()">✉ Email</a>\` : ''}
            \${linkedinVal ? \`<a href="https://\${linkedinVal.replace('http://','').replace('https://','')}\\\" target="_blank" class="btn xs" onclick="event.stopPropagation()">in</a>\` : ''}
          </div>
        </div>
        <div class="lead-card-body" id="body-\${item.id}">
          <div class="lead-intel-box">\${(item.intel||'').replace(/</g,'&lt;')}</div>
          <div class="lead-card-bottom">
            <button class="btn sm success" onclick="importDiscoveryLead('\${item.id}')">➕ Add to Pipeline</button>
            <button class="btn-pipeline locked" title="Approve contact first in Pipeline view" onclick="handlePipelineStart('\${item.id}')">🚀 Start Pipeline</button>
            <button class="btn sm danger" onclick="dismissDiscoveryLead('\${item.id}')">✕ Dismiss</button>
          </div>
        </div>
      </div>\`;
    });
  });

  el.innerHTML = html;
}

function toggleLeadCard(id) {
  const body = document.getElementById('body-' + id);
  if(body) body.classList.toggle('open');
}

function handlePipelineStart(discoveryId) {
  const lead = state.leads.find(l => l.discoverySourceId === discoveryId || l.name === (state.discoveryQueue||[]).find(x=>x.id===discoveryId)?.name);
  if(lead && lead.contactApproved) {
    toast('Pipeline started for ' + lead.name + '! Open Outreach to trigger campaign.');
    log('PIPELINE START', 'Contact approved lead: ' + lead.name);
  } else if(lead) {
    toast('🔒 Contact not yet approved. Open Pipeline → Dossier → Approve Contact first.');
  } else {
    toast('Add this lead to Pipeline first, then approve contact.');
  }
}

function resetAndReloadAllLeads() {
  localStorage.removeItem('claw_intel_v1');
  localStorage.removeItem('claw_apollo_v1');
  localStorage.removeItem('claw_sf_v1');
  state.discoveryQueue = [];
  loadAgentIntel();
  loadApolloLeads();
  loadSouthFloridaLeads();
  renderDiscoveryHero();
  updateIntelBanner();
  toast('Intel reloaded — ' + (state.discoveryQueue||[]).length + ' contacts');
}

// ─── COMMAND CHARTS ────────────────────────────────────────
let miniFunnelChart = null, miniDecayChart = null;
function renderCommandCharts() {
  const stageLabels = window.CLAW.CONFIG.STAGES;
  const stageCounts = stageLabels.map(s => state.leads.filter(l=>l.status===s).length);
  const funnelEl = document.getElementById('mini-funnel-chart');
  if(funnelEl && window.Chart) {
    if(miniFunnelChart) miniFunnelChart.destroy();
    miniFunnelChart = new Chart(funnelEl, {
      type:'bar',
      data:{labels:stageLabels,datasets:[{data:stageCounts,backgroundColor:'#f0c04044',borderColor:'#f0c040',borderWidth:1}]},
      options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#4a5068',font:{size:9}},grid:{color:'#1e2235'}},y:{ticks:{color:'#4a5068',font:{size:9}},grid:{display:false}}}}
    });
  }
  const active = state.leads.filter(l=>!['Archived'].includes(l.status));
  const fresh = active.filter(l=>decayDays(l)<=1).length;
  const warn  = active.filter(l=>decayDays(l)>1 && decayDays(l)<=3).length;
  const crit  = active.filter(l=>decayDays(l)>3).length;
  const decayEl = document.getElementById('mini-decay-chart');
  if(decayEl && window.Chart) {
    if(miniDecayChart) miniDecayChart.destroy();
    miniDecayChart = new Chart(decayEl, {
      type:'doughnut',
      data:{labels:['Fresh','Warn','Cold'],datasets:[{data:[fresh||1,warn,crit],backgroundColor:['#00d26a44','#ff950044','#ff3b3b44'],borderColor:['#00d26a','#ff9500','#ff3b3b'],borderWidth:1}]},
      options:{cutout:'65%',plugins:{legend:{labels:{color:'#4a5068',font:{size:9},boxWidth:10}}}}
    });
  }
}

// ─── BUILD TIMESTAMP ──────────────────────────────────────
const BUILD_TS = '${BUILD_TIME}';
document.addEventListener('DOMContentLoaded', function() {
  const el = document.getElementById('build-ts');
  if(el) {
    const d = new Date(BUILD_TS);
    el.textContent = d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) + ' ET';
  }
});

${mainJS}

// ─── PATCH renderCommand ──────────────────────────────────
const __origRC = renderCommand;
renderCommand = function() {
  __origRC();
  const active = state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const staleCount = active.filter(l=>decayDays(l)>3).length;
  const decayCount = active.filter(l=>decayDays(l)>1).length;
  const ev = calcEV();
  const evEl = document.getElementById('tm-pipeline');
  if(evEl) evEl.textContent = '$'+fmtNum(Math.round(ev.base));
  const activeEl = document.getElementById('cmd-active');
  if(activeEl) activeEl.textContent = active.length;
  const decayEl2 = document.getElementById('cmd-decay');
  if(decayEl2) decayEl2.textContent = decayCount + staleCount;
  const totalSub = document.getElementById('cmd-total-sub');
  if(totalSub) totalSub.textContent = state.leads.length + ' total in system';
  const modeDisplay = document.getElementById('mode-display');
  if(modeDisplay) modeDisplay.textContent = state.autonomyMode || 'SEMI-AUTO';
  updateIntelBanner();
  renderCommandCharts();
};

const __origRA = renderAll;
renderAll = function() {
  __origRA();
  updateIntelBanner();
  renderCommandCharts();
  updateConflictBadge();
};

function updateConflictBadge() {
  const pending = (state.conflicts||[]).filter(c=>c.status==='pending').length;
  const badge = document.getElementById('nav-conflict-badge');
  if(badge) { badge.textContent = pending; badge.style.display = pending ? 'inline-flex' : 'none'; }
}

</script>
</body>
</html>`;

// Patch: remove the self-referential getForecastHTML call (it's now inline)
const finalHtml = html;
fs.writeFileSync('index.html', finalHtml);
console.log('✅ Rebuilt index.html — lines:', finalHtml.split('\n').length, '— size:', Math.round(finalHtml.length/1024)+'KB');
