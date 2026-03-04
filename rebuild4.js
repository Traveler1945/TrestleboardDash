// rebuild4.js — surgical fix: HTML matches what the mainJS actually expects
const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const BUILD_TIME = new Date().toISOString();

function extractJS(src) {
  const datajsIdx = src.indexOf('<script src="data.js"></script>');
  const nextScript = src.indexOf('<script>', datajsIdx);
  return src.slice(nextScript + '<script>'.length, src.lastIndexOf('</script>'));
}
function extractModals(src) {
  const result = [];
  let from = 0;
  while (true) {
    const idx = src.indexOf('<div class="modal-overlay"', from);
    if (idx === -1) break;
    let depth = 0, i = idx;
    while (i < src.length) {
      if (src[i]==='<') {
        if (src.slice(i,i+4)==='<div') depth++;
        else if (src.slice(i,i+6)==='</div') { depth--; if(depth===0){result.push(src.slice(idx,i+6));from=i+6;break;} }
      }
      i++;
    }
    if(from===0)break;
  }
  return result.join('\n\n');
}
function extractAuthGate(src) {
  const idx = src.indexOf('<div id="auth-gate">');
  if(idx===-1)return '';
  let depth=0,i=idx;
  while(i<src.length){
    if(src[i]==='<'){
      if(src.slice(i,i+4)==='<div')depth++;
      else if(src.slice(i,i+6)==='</div'){depth--;if(depth===0)return src.slice(idx,i+6);}
    }
    i++;
  }
  return '';
}

const authGate = extractAuthGate(src);
const modals   = extractModals(src);
const mainJS   = extractJS(src);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Cache-Control" content="no-cache,no-store,must-revalidate">
<title>TRESTLEBOARD OPS</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"><\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#08090e;--s1:#0f1118;--s2:#161922;--s3:#1c2030;
  --br:#222638;--br2:#2d3248;
  --gold:#e8b84b;--gold2:#f5d070;--gf:#e8b84b18;
  --red:#e03e3e;--rf:#e03e3e18;
  --green:#2ec76e;--grF:#2ec76e18;
  --blue:#4d8ef0;--bF:#4d8ef018;
  --purple:#9d60f8;--pF:#9d60f818;
  --text:#dde0f0;--dim:#5a6080;--dim2:#7a80a0;
  --r:3px;
}
body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;min-height:100vh;font-size:13px}

/* ── AUTH ── */
#auth-gate{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:9999;background-image:radial-gradient(ellipse at 50% 20%,#e8b84b0a,transparent 60%)}
#auth-gate.hidden{display:none}
.auth-box{background:var(--s1);border:2px solid var(--gold);padding:52px 60px;width:400px;text-align:center}
.auth-logo{font-size:26px;letter-spacing:8px;color:var(--gold);font-weight:bold;margin-bottom:6px}
.auth-tagline{font-size:9px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;margin-bottom:32px}
.auth-div{border-top:1px solid var(--br);margin:0 0 24px}
.auth-box input[type="password"]{width:100%;background:var(--s2);border:2px solid var(--br2);color:var(--text);padding:16px;font-family:inherit;font-size:20px;text-align:center;letter-spacing:8px;margin-bottom:12px}
.auth-box input:focus{outline:none;border-color:var(--gold)}
.auth-btn{width:100%;background:var(--gold);border:none;color:#000;padding:16px;font-family:inherit;font-size:13px;letter-spacing:4px;text-transform:uppercase;cursor:pointer;font-weight:bold}
.auth-btn:hover{background:var(--gold2)}
.auth-error{color:var(--red);font-size:10px;margin-top:10px;min-height:16px;letter-spacing:1px}

/* ── BUILD BAR ── */
#build-bar{background:#000;border-bottom:1px solid var(--br);padding:5px 20px;display:flex;align-items:center;justify-content:space-between;font-size:9px;color:var(--dim);letter-spacing:1px;position:sticky;top:0;z-index:200}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;animation:blink 2s infinite;margin-right:6px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* ── TOPBAR ── */
.topbar{background:var(--s1);border-bottom:2px solid var(--br);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:26px;z-index:100}
.topbar-logo{display:flex;flex-direction:column}
.topbar-logo .logo-main{font-size:18px;font-weight:bold;color:var(--gold);letter-spacing:6px}
.topbar-logo .logo-sub{font-size:8px;color:var(--dim);letter-spacing:2px;margin-top:3px}
.top-mode{display:flex;align-items:center;gap:6px}
.top-mode .mode-label{font-size:9px;color:var(--dim);letter-spacing:1px;text-transform:uppercase}
/* mode-btn — exact class JS expects */
.mode-btn{background:transparent;border:1px solid var(--br2);color:var(--dim);padding:6px 14px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit;transition:all .15s}
.mode-btn.active,.mode-btn.manual.active{border-color:var(--blue);color:var(--blue);background:var(--bF)}
.mode-btn.semi.active{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.mode-btn.full.active{border-color:var(--green);color:var(--green);background:var(--grF)}
.brief-btn{border:1px solid var(--gold);color:var(--gold);background:var(--gf);padding:6px 14px;font-size:9px;letter-spacing:1px;cursor:pointer;font-family:inherit;text-transform:uppercase}

/* ── MAIN-NAV — exact class JS expects: .main-nav > .nav-pill.active ── */
.main-nav{display:flex;background:var(--s1);border-bottom:2px solid var(--br)}
.nav-pill{flex:1;background:transparent;border:none;border-bottom:3px solid transparent;padding:16px 8px;font-family:inherit;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--dim);cursor:pointer;transition:all .15s;position:relative}
.nav-pill:hover{color:var(--text)}
.nav-pill.active{color:var(--gold);border-bottom-color:var(--gold);background:var(--gf)}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:var(--red);color:#fff;font-size:9px;font-weight:bold;animation:blink 1.5s infinite}
.intel-alert-badge{background:var(--gold);color:#000}

/* ── PAGES — exact class JS expects: .page → hidden, .page.active → shown ── */
.page{display:none}
.page.active{display:block}

/* ── INTEL BANNER — both IDs preserved ── */
.intel-banner{display:none;background:var(--gf);border-bottom:2px solid var(--gold);padding:14px 20px;cursor:pointer;align-items:center;justify-content:space-between}
.intel-banner.show{display:flex}
.intel-banner-inner{display:flex;align-items:center;gap:12px;width:100%}
.intel-banner-icon{font-size:16px;animation:blink 1s infinite;color:var(--gold)}
.intel-banner-text h3{font-size:12px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:2px}
.intel-banner-text p{font-size:10px;color:var(--dim2)}
.intel-banner-arrow{margin-left:auto;color:var(--gold);font-size:16px;font-weight:bold}

/* ── STAT GRID (4 big tiles) ── */
.mission-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--br)}
.stat-tile{background:var(--s1);padding:24px 16px;text-align:center;position:relative;overflow:hidden}
.stat-tile::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.stat-tile.ev::before{background:var(--gold)}
.stat-tile.active::before{background:var(--green)}
.stat-tile.risk::before{background:var(--red)}
.stat-tile.intel::before{background:var(--purple)}
.stat-tile-val{font-size:36px;font-weight:bold;line-height:1;margin-bottom:6px;font-family:'Courier New',monospace}
.stat-tile.ev .stat-tile-val{color:var(--gold)}
.stat-tile.active .stat-tile-val{color:var(--green)}
.stat-tile.risk .stat-tile-val{color:var(--red)}
.stat-tile.intel .stat-tile-val{color:var(--purple)}
.stat-tile-label{font-size:9px;color:var(--dim);letter-spacing:2px;text-transform:uppercase}
.stat-tile-sub{font-size:9px;color:var(--dim);margin-top:4px}

/* ── CMD BODY ── */
.cmd-body{display:grid;grid-template-columns:1fr 320px}
.cmd-left{padding:20px;border-right:1px solid var(--br)}
.cmd-right{padding:20px;background:var(--s1)}
.blk-label{font-size:9px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid var(--br)}

/* Priority card */
.priority-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--br2);padding:13px 15px;margin-bottom:8px;cursor:pointer;transition:border-left-color .15s;border-radius:0 var(--r) var(--r) 0}
.priority-card:hover{border-left-color:var(--gold)}
.priority-card.p-critical{border-left-color:var(--red)}
.priority-card.p-high{border-left-color:var(--gold)}
.priority-card.p-med{border-left-color:var(--green)}
.priority-card-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.priority-card-name{font-size:14px;font-weight:bold;flex:1}
.priority-card-org{font-size:10px;color:var(--dim2);margin-bottom:4px}
.priority-card-nba{font-size:10px;color:var(--blue)}
.priority-card-badges{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:6px}

/* Guide / empty state */
.guide-box{text-align:center;padding:48px 20px;color:var(--dim)}
.guide-title{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:var(--dim2);margin-bottom:10px}
.guide-text{font-size:11px;line-height:1.7;margin-bottom:20px}

/* Mini chart boxes */
.cmd-chart-card{background:var(--s2);padding:12px;margin-bottom:12px;border-radius:var(--r)}
.cmd-chart-label{font-size:9px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}

/* ── PIPELINE ── */
/* pipeline-sub-nav — exact class JS expects */
.pipeline-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--br);background:var(--s1)}
.pipeline-sub-nav{display:flex;gap:4px}
/* sub-pill — exact class JS expects */
.sub-pill{background:transparent;border:1px solid var(--br2);color:var(--dim);padding:7px 16px;font-size:9px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:all .15s}
.sub-pill.active{background:var(--gf);border-color:var(--gold);color:var(--gold)}
/* pipeline-view — exact class JS expects */
.pipeline-view{display:none;padding:20px}
.pipeline-view.active{display:block}

/* Kanban */
.kanban{display:flex;gap:8px;overflow-x:auto;padding-bottom:12px}
.kanban-col{min-width:165px;flex:1;background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--br2);border-radius:var(--r)}
.kanban-col-header{padding:10px 12px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between;align-items:center}
.kanban-col-title{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--dim)}
.kanban-col-count{font-size:9px;color:var(--dim)}
.kanban-col-body{padding:6px;min-height:80px}
.kanban-card{background:var(--s2);border-left:3px solid var(--br2);padding:10px;margin-bottom:6px;cursor:grab;transition:border-left-color .15s;border-radius:0 var(--r) var(--r) 0}
.kanban-card:hover{border-left-color:var(--gold)}
.kanban-card.dragging{opacity:.3}
.kanban-card.decay-hot{border-left-color:var(--red)}
.kanban-card.decay-warn{border-left-color:var(--gold)}
.kanban-card.decay-ok{border-left-color:var(--green)}
.kanban-col.drag-over{background:var(--gf);border-color:var(--gold)}
.card-name{font-size:12px;font-weight:bold;margin-bottom:2px}
.card-org{font-size:9px;color:var(--dim2);margin-bottom:5px}
.card-score-bar{height:2px;background:var(--br);margin-bottom:4px;overflow:hidden}
.card-score-fill{height:100%}
.card-score-label{font-size:9px;color:var(--dim);margin-bottom:4px}
.card-actions{display:flex;gap:3px;flex-wrap:wrap}

/* Table */
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:8px 12px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--br)}
td{padding:9px 12px;border-bottom:1px solid var(--br);font-size:11px;vertical-align:middle}
tr:hover td{background:var(--s2)}

/* FAB */
.fab{position:fixed;bottom:24px;right:24px;background:var(--gold);color:#000;border:none;width:54px;height:54px;border-radius:50%;font-size:26px;cursor:pointer;display:none;align-items:center;justify-content:center;font-weight:bold;z-index:300;transition:all .15s}
.fab.visible{display:flex}
.fab:hover{background:var(--gold2)}

/* ── INTEL / ACCORDION — exact classes JS expects ── */
/* accordion-header.open = panel visible, toggleIntelPanel() toggles */
.accordion-header{display:flex;justify-content:space-between;align-items:center;background:var(--s1);padding:13px 16px;cursor:pointer;border-left:3px solid transparent;user-select:none;transition:all .15s}
.accordion-header:hover{background:var(--s2)}
.accordion-header.open{border-left-color:var(--gold);background:var(--s2)}
.accordion-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--dim)}
.accordion-header.open .accordion-title{color:var(--gold)}
.accordion-chevron{font-size:10px;color:var(--dim);transition:transform .2s;font-style:normal}
.accordion-header.open .accordion-chevron{transform:rotate(180deg);color:var(--gold)}
.accordion-body{display:none;padding:20px;background:var(--s2);border-left:3px solid var(--gold)}

/* ── DISCOVERY HERO ── */
.intel-count-bar{background:var(--gf);border:1px solid var(--gold);padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;border-radius:var(--r)}
.intel-count-num{font-size:28px;font-weight:bold;color:var(--gold)}
.intel-count-label{font-size:10px;color:var(--dim2);letter-spacing:1px;margin-top:2px}
.vgroup-label{font-size:9px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;padding:8px 0;border-bottom:1px solid var(--br);margin-bottom:8px;margin-top:16px}

/* Contact card */
.ccard{background:var(--s1);border:1px solid var(--br);margin-bottom:8px;overflow:hidden;border-radius:var(--r);transition:border-color .15s}
.ccard:hover{border-color:var(--br2)}
.ccard-top{display:flex;align-items:center;gap:14px;padding:14px 16px;cursor:pointer}
.ccard-conf{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;border:2px solid;flex-shrink:0}
.conf-high{background:var(--grF);border-color:var(--green);color:var(--green)}
.conf-med{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.conf-low{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.ccard-info{flex:1;min-width:0}
.ccard-name{font-size:15px;font-weight:bold;margin-bottom:2px}
.ccard-role{font-size:10px;color:var(--dim2);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ccard-org{font-size:11px;color:var(--gold);margin-bottom:2px}
.ccard-loc{font-size:9px;color:var(--dim)}
.ccard-quick-btns{display:flex;flex-direction:column;gap:5px;align-items:flex-end;flex-shrink:0}
.ccard-body{display:none;padding:0 16px 16px;border-top:1px solid var(--br)}
.ccard-body.expanded{display:block}
.intel-txt{background:var(--s2);padding:12px 14px;font-size:11px;color:#b0b5cc;line-height:1.8;margin:12px 0;white-space:pre-wrap;border-left:2px solid var(--br2)}
.ccard-foot{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}

/* START PIPELINE button */
.btn-start-pipeline{background:var(--green);border:none;color:#000;padding:8px 18px;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;cursor:pointer;font-family:inherit;transition:opacity .15s}
.btn-start-pipeline:hover{opacity:.85}
.btn-start-pipeline.locked{background:var(--s2);border:1px solid var(--br2);color:var(--dim);cursor:not-allowed}
.btn-start-pipeline.locked:hover{opacity:1}

/* ── BUTTONS ── */
.btn{background:none;border:1px solid var(--br2);color:var(--text);padding:7px 14px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1px;text-transform:uppercase;transition:all .15s;border-radius:var(--r)}
.btn:hover{border-color:var(--gold);color:var(--gold)}
.btn.primary{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.btn.primary:hover{background:var(--gold);color:#000}
.btn.success{border-color:var(--green);color:var(--green);background:var(--grF)}
.btn.success:hover{background:var(--green);color:#000}
.btn.danger{border-color:var(--red);color:var(--red)}
.btn.danger:hover{background:var(--red);color:#fff}
.btn.warn{border-color:var(--gold);color:var(--gold)}
.btn.sm{padding:4px 10px;font-size:9px}
.btn.xs{padding:2px 8px;font-size:9px;letter-spacing:0;text-transform:none}
.btn.link{border:none;color:var(--dim);padding:2px 4px;font-size:9px}
.btn.link:hover{color:var(--gold);border:none}

/* ── TAGS ── */
.tag{display:inline-block;padding:2px 7px;font-size:9px;letter-spacing:1px;text-transform:uppercase;border:1px solid;border-radius:var(--r)}
.tag.amber,.tag.warn{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.tag.green{background:var(--grF);border-color:var(--green);color:var(--green)}
.tag.red{background:var(--rf);border-color:var(--red);color:var(--red)}
.tag.blue{background:var(--bF);border-color:var(--blue);color:var(--blue)}
.tag.gray{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.tag.purple{background:var(--pF);border-color:var(--purple);color:var(--purple)}
.score-badge{display:inline-flex;align-items:center;justify-content:center;width:34px;height:22px;font-size:10px;font-weight:bold;border:1px solid;border-radius:var(--r)}
.score-hot{background:var(--rf);border-color:var(--red);color:var(--red)}
.score-warm{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.score-cool{background:var(--grF);border-color:var(--green);color:var(--green)}
.score-cold{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.priority-badge{padding:2px 8px;border:1px solid;font-size:9px;letter-spacing:1px;text-transform:uppercase;border-radius:var(--r)}
.priority-critical{background:var(--rf);border-color:var(--red);color:var(--red)}
.priority-high{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.priority-med{background:var(--grF);border-color:var(--green);color:var(--green)}
.priority-low{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.hold-badge{background:var(--pF);border:1px solid var(--purple);color:var(--purple);padding:2px 7px;font-size:9px;letter-spacing:1px;border-radius:var(--r)}
.decay-indicator{font-size:9px}
.decay-hot{color:var(--red)}
.decay-warn{color:var(--gold)}
.decay-ok{color:var(--green)}

/* ── FORMS ── */
.form-group{margin-bottom:12px}
label{display:block;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--dim);margin-bottom:4px}
input,textarea,select{width:100%;background:var(--s2);border:1px solid var(--br2);color:var(--text);padding:8px 10px;font-family:inherit;font-size:12px;border-radius:var(--r)}
input:focus,textarea:focus,select:focus{outline:1px solid var(--gold)}
textarea{resize:vertical;min-height:70px}
select{cursor:pointer}

/* ── STAT CARDS ── */
.stats-row{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.stat-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:14px 16px;flex:1;min-width:100px;border-radius:var(--r)}
.stat-card.warn{border-top-color:var(--gold)}
.stat-card.danger{border-top-color:var(--red)}
.stat-card.success{border-top-color:var(--green)}
.stat-value{font-size:22px;color:var(--gold);font-weight:bold}
.stat-card.danger .stat-value{color:var(--red)}
.stat-card.success .stat-value{color:var(--green)}
.stat-label{font-size:9px;color:var(--dim);letter-spacing:1px;text-transform:uppercase;margin-top:4px}
.stat-sub{font-size:9px;color:var(--dim);margin-top:2px}

/* ── MISC SECTION COMPONENTS ── */
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.section-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}
.section-actions{display:flex;gap:6px;flex-wrap:wrap}
.info-panel{background:var(--bF);border:1px solid var(--blue);border-left:4px solid var(--blue);padding:10px 14px;color:#9ec5ff;font-size:11px;margin-bottom:12px;border-radius:0 var(--r) var(--r) 0}
.info-panel strong{color:#fff}
.alert-strip{background:var(--gf);border:1px solid var(--gold);border-left:4px solid var(--gold);padding:10px 14px;margin-bottom:8px;font-size:11px;color:var(--gold);display:flex;justify-content:space-between;align-items:center;border-radius:0 var(--r) var(--r) 0}
.alert-strip.danger{background:var(--rf);border-color:var(--red);color:var(--red)}
.forecast-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px}
.forecast-card{background:var(--s1);border:1px solid var(--br);padding:16px;text-align:center;border-radius:var(--r)}
.forecast-card.conservative{border-top:2px solid var(--dim)}
.forecast-card.base{border-top:2px solid var(--gold)}
.forecast-card.upside{border-top:2px solid var(--green)}
.forecast-val{font-size:22px;font-weight:bold;color:var(--gold)}
.forecast-card.conservative .forecast-val{color:var(--dim)}
.forecast-card.upside .forecast-val{color:var(--green)}
.forecast-label{font-size:9px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-top:4px}
.forecast-desc{font-size:10px;color:var(--dim);margin-top:6px}
.pipeline-row{display:flex;gap:8px;margin-bottom:8px}
.pipeline-stage-label{font-size:9px;color:var(--dim);width:110px;flex-shrink:0;padding-top:5px;letter-spacing:1px}
.pipeline-bar-wrap{flex:1;background:var(--s2);height:24px;position:relative;border:1px solid var(--br)}
.pipeline-bar-fill{height:100%;background:var(--gold);opacity:.6;transition:width .4s}
.pipeline-bar-label{position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:9px;color:var(--text)}
.pipeline-ev{width:80px;text-align:right;font-size:10px;color:var(--gold);padding-top:4px}
.obj-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:12px 14px;margin-bottom:8px;border-radius:0 var(--r) var(--r) 0}
.obj-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.obj-type{font-size:11px;color:var(--gold);letter-spacing:1px}
.obj-vertical{font-size:9px;color:var(--dim)}
.obj-counter{font-size:10px;color:#aaa;margin-bottom:6px;line-height:1.5}
.sequence-card{background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:8px;border-radius:var(--r)}
.sequence-header{display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.sequence-title{font-size:12px;margin-bottom:2px;font-weight:bold}
.sequence-meta{font-size:10px;color:var(--dim)}
.sequence-steps{display:flex;margin-bottom:10px}
.step{flex:1;padding:6px 4px;border:1px solid var(--br);font-size:9px;text-align:center;color:var(--dim);background:var(--s2)}
.step.done{border-color:var(--green);color:var(--green);background:var(--grF)}
.step.active{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.sequence-actions{display:flex;gap:5px;flex-wrap:wrap}
.queue-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:14px;margin-bottom:8px;border-radius:0 var(--r) var(--r) 0}
.queue-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.queue-card-title{font-size:12px;margin-bottom:2px;font-weight:bold}
.queue-card-meta{font-size:10px;color:var(--dim)}
.queue-card-body{font-size:11px;color:#999;margin-bottom:8px;line-height:1.5}
.queue-card-actions{display:flex;gap:5px;flex-wrap:wrap}
.meeting-card{background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:8px;border-radius:var(--r)}
.meeting-header{display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.log-entry{display:flex;gap:12px;padding:6px 0;border-bottom:1px solid var(--br);font-size:10px}
.log-time{color:var(--dim);white-space:nowrap;min-width:130px}
.log-actor{color:var(--gold);min-width:70px}
.log-action{color:var(--text)}
.dossier{background:var(--s2);border:1px solid var(--br);padding:14px;font-size:12px;line-height:1.8;border-radius:var(--r)}
.dossier h4{color:var(--gold);letter-spacing:1px;text-transform:uppercase;font-size:10px;margin:12px 0 4px;border-bottom:1px solid var(--br);padding-bottom:3px}
.dossier p{color:#aaa}
.score-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.score-row{background:var(--s2);border:1px solid var(--br);padding:6px 10px;border-radius:var(--r)}
.score-row-label{font-size:9px;color:var(--dim);letter-spacing:1px}
.score-row-val{font-size:13px;color:var(--gold);font-weight:bold;margin-top:2px}
.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:16px}
.agent-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:12px 14px;display:flex;flex-direction:column;gap:6px;border-radius:var(--r)}
.agent-card h4{font-size:11px;color:var(--gold);letter-spacing:1px;text-transform:uppercase}
.agent-card p{font-size:10px;color:var(--dim);line-height:1.4}
.agent-card .agent-meta{display:flex;justify-content:space-between;font-size:9px;color:var(--dim)}
.agent-conflict{background:var(--rf);border:1px solid var(--red);color:var(--red);padding:2px 6px;font-size:9px;letter-spacing:1px;border-radius:var(--r)}
.conflict-list{display:flex;flex-direction:column;gap:8px}
.conflict-item{background:var(--s1);border:1px solid var(--br);padding:10px 12px;border-radius:var(--r)}
.conflict-item h5{font-size:10px;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.conflict-item p{font-size:10px;color:#aaa;margin-bottom:4px}
.conflict-status{font-size:9px;letter-spacing:1px;text-transform:uppercase}
.conflict-status.pending{color:var(--gold)}
.conflict-status.resolved{color:var(--green)}
.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sim-card{background:var(--s1);border:1px solid var(--br);padding:14px;border-radius:var(--r)}
.sim-card h4{font-size:10px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:8px}
.sim-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sim-output{margin-top:12px;background:var(--s2);border:1px solid var(--br);padding:12px;font-size:11px;line-height:1.6;color:#cfd6ff;min-height:100px;white-space:pre-wrap;border-radius:var(--r)}
.constraints-panel{background:var(--s1);border:1px solid var(--br);padding:16px;margin-bottom:12px;border-radius:var(--r)}
.constraints-panel h4{font-size:10px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
.constraints-panel ol{padding-left:16px;font-size:11px;line-height:1.6;color:#ccc}
.constraints-panel li{margin-bottom:4px}
.constraints-subgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.constraints-subgrid div{background:var(--s2);border:1px solid var(--br);padding:10px;font-size:10px;line-height:1.5;border-radius:var(--r)}
.constraints-subgrid strong{color:var(--gold);display:block;margin-bottom:3px;letter-spacing:1px}
.disc-log{background:var(--bg);border:1px solid var(--br);padding:10px;font-size:10px;max-height:180px;overflow-y:auto;margin-top:12px;color:var(--dim);border-radius:var(--r)}
.discovery-toggle{display:flex;gap:6px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
.disc-mode-btn{border:1px solid var(--br2);background:transparent;color:var(--dim);padding:5px 12px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit;border-radius:var(--r)}
.disc-mode-btn.active-OFF{border-color:var(--dim);color:var(--dim)}
.disc-mode-btn.active-SEARCHING{border-color:var(--green);color:var(--green);background:var(--grF)}
.disc-mode-btn.active-PAUSED{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chart-card{background:var(--s1);border:1px solid var(--br);padding:16px;border-radius:var(--r)}
.chart-card-title{font-size:9px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.chart-card.full{grid-column:span 2}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;align-items:center;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:var(--s1);border:2px solid var(--gold);width:540px;max-width:95vw;max-height:90vh;overflow-y:auto;border-radius:var(--r)}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--br)}
.modal-title{color:var(--gold);letter-spacing:2px;text-transform:uppercase;font-size:11px}
.modal-close{background:none;border:none;color:var(--dim);cursor:pointer;font-size:18px}
.modal-body{padding:18px}
.modal-footer{padding:12px 18px;border-top:1px solid var(--br);display:flex;gap:6px;justify-content:flex-end}
#toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--s1);border:1px solid var(--gold);color:var(--gold);padding:10px 22px;font-size:11px;letter-spacing:1px;z-index:9999;display:none;border-radius:var(--r)}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--br2)}
::-webkit-scrollbar-thumb:hover{background:var(--dim)}

@media(max-width:768px){
  .mission-stats{grid-template-columns:1fr 1fr}
  .cmd-body{grid-template-columns:1fr}
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
  <div style="display:flex;gap:14px;align-items:center">
    <span><span class="live-dot"></span>LIVE</span>
    <span>TRESTLEBOARD OPS</span>
    <span>LAST UPDATED: <strong id="build-ts" style="color:var(--gold)">--</strong></span>
  </div>
  <span id="current-time" style="color:var(--dim);font-size:9px"></span>
</div>

<!-- TOPBAR -->
<div class="topbar">
  <div class="topbar-logo">
    <div class="logo-main">TRESTLEBOARD</div>
    <div class="logo-sub">REVENUE OPERATIONS SYSTEM</div>
  </div>
  <div class="top-mode">
    <span class="mode-label">MODE</span>
    <div id="mode-selector">
      <button class="mode-btn manual" data-mode="MANUAL" onclick="setAutonomyMode('MANUAL')">MANUAL</button>
      <button class="mode-btn semi" data-mode="SEMI-AUTO" onclick="setAutonomyMode('SEMI-AUTO')">SEMI</button>
      <button class="mode-btn full" data-mode="FULL AUTO" onclick="setAutonomyMode('FULL AUTO')">FULL</button>
    </div>
    <button class="brief-btn" onclick="openStrategicBrief()">BRIEF</button>
  </div>
</div>

<!-- MAIN NAV — class names match what mainJS expects -->
<div class="main-nav">
  <button class="nav-pill" onclick="showPage('command',this)">COMMAND</button>
  <button class="nav-pill" onclick="showPage('pipeline',this)">PIPELINE</button>
  <button class="nav-pill" onclick="showPage('intel',this)">
    INTEL <span class="badge intel-alert-badge" id="nav-intel-badge" style="display:none">0</span>
  </button>
</div>

<!-- ══════════════════ PAGE: COMMAND ══════════════════ -->
<div class="page" id="page-command">

  <!-- Intel banner — both old and new IDs present for compatibility -->
  <div class="intel-banner" id="intel-banner" onclick="showPage('intel', document.querySelector('.nav-pill:nth-child(3)'))">
    <div class="intel-banner-inner">
      <span class="intel-banner-icon">!</span>
      <div class="intel-banner-text">
        <h3 id="intel-banner-msg">CONTACTS WAITING FOR REVIEW</h3>
        <p>Go to Intel to review discovered contacts and add them to your pipeline.</p>
      </div>
      <span class="intel-banner-arrow">&#8594;</span>
    </div>
  </div>
  <!-- duplicate ID aliases for JS compat -->
  <div id="nav-discovery-indicator" style="display:none"></div>

  <!-- Alert container -->
  <div id="alert-container"></div>

  <!-- 4 big stat tiles -->
  <div class="mission-stats">
    <div class="stat-tile ev">
      <div class="stat-tile-label">Pipeline Value</div>
      <div class="stat-tile-val" id="tm-pipeline">$0</div>
      <div class="stat-tile-sub">expected revenue</div>
    </div>
    <div class="stat-tile active">
      <div class="stat-tile-label">Active Leads</div>
      <div class="stat-tile-val" id="cmd-active">0</div>
      <div class="stat-tile-sub" id="cmd-total-sub">in pipeline</div>
    </div>
    <div class="stat-tile risk">
      <div class="stat-tile-label">Need Attention</div>
      <div class="stat-tile-val" id="cmd-decay">0</div>
      <div class="stat-tile-sub">cold or stale</div>
    </div>
    <div class="stat-tile intel">
      <div class="stat-tile-label">Intel Waiting</div>
      <div class="stat-tile-val" id="cmd-intel-count">0</div>
      <div class="stat-tile-sub">contacts to review</div>
    </div>
  </div>

  <!-- Command split -->
  <div class="cmd-body">
    <div class="cmd-left">
      <div class="blk-label">PRIORITY TARGETS — WHAT TO DO NEXT</div>
      <div id="cmd-hot-leads">
        <div class="guide-box">
          <div class="guide-title">NO LEADS IN PIPELINE YET</div>
          <div class="guide-text">You have contacts waiting in your Intel tab.<br>Go there, expand any card, and click ADD TO PIPELINE.</div>
          <button class="btn primary" onclick="showPage('intel',document.querySelector('.nav-pill:nth-child(3)'))">GO TO INTEL</button>
        </div>
      </div>
    </div>
    <div class="cmd-right">
      <div class="blk-label">PIPELINE OVERVIEW</div>
      <div class="cmd-chart-card">
        <div class="cmd-chart-label">LEADS BY STAGE</div>
        <canvas id="mini-funnel-chart" height="120"></canvas>
      </div>
      <div class="cmd-chart-card">
        <div class="cmd-chart-label">LEAD HEALTH</div>
        <canvas id="mini-decay-chart" height="90"></canvas>
      </div>
      <div style="background:var(--s2);padding:10px;font-size:9px;color:var(--dim);line-height:1.6;margin-top:12px;border-radius:var(--r)">
        MODE: <span id="mode-display" style="color:var(--gold)">SEMI-AUTO</span><br>
        Hard limits active. Contact wall enabled.
      </div>
    </div>
  </div>

  <!-- Hidden compat elements -->
  <span id="cmd-stale" style="display:none"></span>
  <span id="cmd-briefings" style="display:none"></span>
  <span id="cmd-closed" style="display:none"></span>
  <span id="tm-leads" style="display:none"></span>
  <span id="tm-decay" style="display:none"></span>
  <span id="cmd-total" style="display:none"></span>
  <span id="cmd-contact-approved" style="display:none"></span>
  <span id="cmd-contact-locked" style="display:none"></span>
  <span id="nav-conflict-badge" style="display:none"></span>
  <div id="hold-info"></div>
  <div id="cmd-forecast-mini" style="display:none"></div>
  <div id="cmd-objections-mini" style="display:none"></div>
  <div id="constraints-banner" style="display:none"></div>
</div>

<!-- ══════════════════ PAGE: PIPELINE ══════════════════ -->
<div class="page" id="page-pipeline">
  <div class="pipeline-header">
    <div class="pipeline-sub-nav">
      <button class="sub-pill active" onclick="showPipelineView('kanban',this)">BOARD VIEW</button>
      <button class="sub-pill" onclick="showPipelineView('table',this)">LIST VIEW</button>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn sm" onclick="exportLeads()">EXPORT</button>
      <button class="btn primary sm" onclick="openAddLead()">+ ADD LEAD</button>
    </div>
  </div>
  <div class="pipeline-view active" id="pview-kanban">
    <div class="kanban" id="kanban-board"></div>
  </div>
  <div class="pipeline-view" id="pview-table">
    <table>
      <thead><tr>
        <th>Score</th><th>Name</th><th>Org</th><th>Vertical</th>
        <th>Stage</th><th>Decay</th><th>Priority</th><th>Next Action</th>
        <th>Profile</th><th>Value</th><th>Contact</th><th>Actions</th>
      </tr></thead>
      <tbody id="lead-tbody"></tbody>
    </table>
  </div>
  <button class="fab visible" id="fab-add" onclick="openAddLead()">+</button>
</div>

<!-- ══════════════════ PAGE: INTEL ══════════════════ -->
<div class="page" id="page-intel">

  <!-- Discovery hero: contact cards -->
  <div style="max-width:900px;margin:0 auto;padding:20px">
    <div id="discovery-hero"></div>
  </div>

  <!-- Accordion sub-sections -->
  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">ANALYTICS</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body">
    <div id="section-analytics-inner"></div>
  </div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">REVENUE FORECAST</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body">
    <div class="section-header"><div class="section-title">Revenue Forecast</div><div class="section-actions"><button class="btn sm" onclick="renderForecast()">Recalculate</button></div></div>
    <div class="forecast-grid">
      <div class="forecast-card conservative"><div class="forecast-val" id="fc-conservative">$0</div><div class="forecast-label">Conservative</div><div class="forecast-desc">P(close) x 0.7</div></div>
      <div class="forecast-card base"><div class="forecast-val" id="fc-base">$0</div><div class="forecast-label">Base Case</div></div>
      <div class="forecast-card upside"><div class="forecast-val" id="fc-upside">$0</div><div class="forecast-label">Upside</div><div class="forecast-desc">P(close) x 1.3</div></div>
    </div>
    <div id="pipeline-bars"></div>
    <table><thead><tr><th>Lead</th><th>Stage</th><th>Score</th><th>Value</th><th>P(Close)</th><th>Mult</th><th>EV</th></tr></thead><tbody id="forecast-tbody"></tbody></table>
  </div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">SIMULATION ENGINE</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-simulation-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">CAMPAIGNS</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-outreach-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">CONTENT QUEUE</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-content-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">OBJECTIONS</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-objections-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">MEETINGS</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-meetings-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">AGENTS</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-agents-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">RULES</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-constraints-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">AUDIT LOG</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-auditlog-inner"></div></div>

  <!-- Legacy hidden IDs for discovery sub-system -->
  <div style="display:none">
    <div id="section-discovery-inner">
      <div class="discovery-toggle">
        <button id="disc-btn-OFF" class="disc-mode-btn active-OFF" onclick="setDiscoveryMode('OFF')">OFF</button>
        <button id="disc-btn-SEARCHING" class="disc-mode-btn" onclick="setDiscoveryMode('SEARCHING')">SEARCHING</button>
        <button id="disc-btn-PAUSED" class="disc-mode-btn" onclick="setDiscoveryMode('PAUSED')">PAUSED</button>
        <input id="disc-webhook-input" placeholder="Webhook URL (optional)" style="width:240px">
      </div>
      <table><tbody id="discovery-queue-tbody"></tbody></table>
      <ul id="disc-log-list"></ul>
    </div>
  </div>

</div>

${modals}
<div id="toast"></div>

<script src="data.js"><\/script>
<script>
${mainJS}

// ══ POST-MAINJS OVERRIDES ══════════════════════════════════
// These run AFTER mainJS so they correctly override stale nav functions.

// Fix: showPage uses .active on .page and .nav-pill (already correct in mainJS extracted from v2.3)
// But make absolutely sure the first page is activated on load:
(function initNav() {
  // Activate COMMAND tab and page on first load
  const pages = document.querySelectorAll('.page');
  const pills = document.querySelectorAll('.main-nav .nav-pill');
  pages.forEach(p => p.classList.remove('active'));
  pills.forEach(p => p.classList.remove('active'));
  const cmdPage = document.getElementById('page-command');
  if(cmdPage) cmdPage.classList.add('active');
  if(pills[0]) pills[0].classList.add('active');
})();

// Build timestamp
(function() {
  const el = document.getElementById('build-ts');
  if(el) {
    try {
      const d = new Date('${BUILD_TIME}');
      el.textContent = d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) + ' ET';
    } catch(e) { el.textContent = 'recent'; }
  }
})();

// Intel banner: update on any renderCommand/renderAll call
function _syncIntelBanner() {
  const q = state.discoveryQueue || [];
  const banner = document.getElementById('intel-banner');
  const badge  = document.getElementById('nav-intel-badge');
  const count  = document.getElementById('cmd-intel-count');
  const msg    = document.getElementById('intel-banner-msg');
  if(q.length > 0) {
    if(banner) banner.classList.add('show');
    if(badge)  { badge.style.display = 'inline-flex'; badge.textContent = q.length; }
    if(count)  count.textContent = q.length;
    if(msg)    msg.textContent = q.length + ' CONTACTS WAITING FOR REVIEW';
  } else {
    if(banner) banner.classList.remove('show');
    if(badge)  badge.style.display = 'none';
    if(count)  count.textContent = '0';
  }
}

// Mini charts for command page
let _mFC = null, _mDC = null;
function _renderCommandCharts() {
  const sl = (window.CLAW && window.CLAW.CONFIG && window.CLAW.CONFIG.STAGES) || [];
  const sc = sl.map(s => state.leads.filter(l => l.status === s).length);
  const fe = document.getElementById('mini-funnel-chart');
  if(fe && window.Chart) {
    if(_mFC) _mFC.destroy();
    _mFC = new Chart(fe, {
      type: 'bar',
      data: { labels: sl, datasets: [{ data: sc, backgroundColor: '#e8b84b33', borderColor: '#e8b84b', borderWidth: 1 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#5a6080', font: { size: 9 } }, grid: { color: '#222638' } }, y: { ticks: { color: '#5a6080', font: { size: 9 } }, grid: { display: false } } } }
    });
  }
  const ac = state.leads.filter(l => l.status !== 'Archived');
  const fr = ac.filter(l => decayDays(l) <= 1).length;
  const wn = ac.filter(l => decayDays(l) > 1 && decayDays(l) <= 3).length;
  const cr = ac.filter(l => decayDays(l) > 3).length;
  const de = document.getElementById('mini-decay-chart');
  if(de && window.Chart) {
    if(_mDC) _mDC.destroy();
    _mDC = new Chart(de, {
      type: 'doughnut',
      data: { labels: ['Good', 'Watch', 'Cold'], datasets: [{ data: [fr || 1, wn, cr], backgroundColor: ['#2ec76e33', '#e8b84b33', '#e03e3e33'], borderColor: ['#2ec76e', '#e8b84b', '#e03e3e'], borderWidth: 1 }] },
      options: { cutout: '65%', plugins: { legend: { labels: { color: '#5a6080', font: { size: 9 }, boxWidth: 10 } } } }
    });
  }
}

// Discovery hero render
function renderDiscoveryHero() {
  const el = document.getElementById('discovery-hero');
  if(!el) return;
  const q = state.discoveryQueue || [];
  if(!q.length) {
    el.innerHTML = '<div class="guide-box"><div class="guide-title">NO INTEL YET</div><div class="guide-text">Discovery queue is empty. Click Reload to restore all 21 contacts.</div><button class="btn primary" onclick="resetAndReloadAllLeads()">RELOAD CONTACTS</button></div>';
    return;
  }
  const vmap = {};
  q.forEach(item => { const v = item.vertical || 'Other'; if(!vmap[v]) vmap[v] = []; vmap[v].push(item); });
  let html = '<div class="intel-count-bar"><div><div class="intel-count-num">' + q.length + '</div><div class="intel-count-label">VERIFIED CONTACTS — TAP TO EXPAND</div></div><button class="btn sm" onclick="resetAndReloadAllLeads()">RELOAD ALL</button></div>';
  html += '<div style="font-size:9px;color:var(--dim);margin-bottom:12px">Green ring = high confidence (85%+) &nbsp;|&nbsp; Gold = medium (70-84%) &nbsp;|&nbsp; Gray = lower</div>';
  Object.entries(vmap).forEach(([v, items]) => {
    html += '<div class="vgroup-label">' + v + ' (' + items.length + ')</div>';
    items.forEach(item => {
      const cc = item.confidence >= 85 ? 'conf-high' : item.confidence >= 70 ? 'conf-med' : 'conf-low';
      const lines = (item.intel || '').split('\\n');
      const firstLine = lines[0] || '';
      const emailLine = lines.find(l => l.toLowerCase().includes('email')) || '';
      const liLine    = lines.find(l => l.toLowerCase().includes('linkedin')) || '';
      const emailMatch = emailLine.match(/:\\s*([^\\s(]+@[^\\s]+)/);
      const emailVal   = emailMatch ? emailMatch[1].trim() : '';
      const liMatch    = liLine.match(/(linkedin\\.com\\/in\\/[^\\s]+)/i);
      const liVal      = liMatch ? liMatch[1] : '';
      html += '<div class="ccard" id="card-' + item.id + '">';
      html += '<div class="ccard-top" onclick="_toggleCard(\\'' + item.id + '\\')">';
      html += '<div class="ccard-conf ' + cc + '">' + item.confidence + '%</div>';
      html += '<div class="ccard-info"><div class="ccard-name">' + (item.name || 'Unknown') + '</div>';
      html += '<div class="ccard-role">' + firstLine.substring(0, 70) + '</div>';
      html += '<div class="ccard-org">' + (item.org || '') + '</div>';
      if(item.location) html += '<div class="ccard-loc">' + item.location + '</div>';
      html += '</div>';
      html += '<div class="ccard-quick-btns">';
      if(emailVal) html += '<a href="mailto:' + emailVal + '" class="btn xs primary" onclick="event.stopPropagation()">EMAIL</a>';
      if(liVal)    html += '<a href="https://' + liVal + '" target="_blank" class="btn xs" onclick="event.stopPropagation()">LINKEDIN</a>';
      html += '</div>';
      html += '</div>';
      html += '<div class="ccard-body" id="body-' + item.id + '">';
      html += '<div class="intel-txt">' + (item.intel || '').replace(/</g, '&lt;') + '</div>';
      html += '<div class="ccard-foot">';
      html += '<button class="btn success sm" onclick="importDiscoveryLead(\\'' + item.id + '\\')">ADD TO PIPELINE</button>';
      html += '<button class="btn-start-pipeline locked" onclick="_handlePipelineStart(\\'' + item.id + '\\')">START PIPELINE</button>';
      html += '<button class="btn danger sm" onclick="dismissDiscoveryLead(\\'' + item.id + '\\')">DISMISS</button>';
      html += '</div></div></div>';
    });
  });
  el.innerHTML = html;
}

function _toggleCard(id) {
  const b = document.getElementById('body-' + id);
  if(b) b.classList.toggle('expanded');
}

function _handlePipelineStart(discId) {
  const qItem = (state.discoveryQueue || []).find(x => x.id === discId);
  const lead  = state.leads.find(l => l.name === (qItem && qItem.name));
  if(lead && lead.contactApproved) {
    toast('Pipeline started for ' + lead.name);
    log('PIPELINE START', 'Lead: ' + lead.name);
  } else if(lead) {
    toast('LOCKED — Open Pipeline, find this lead, approve contact, then Start Pipeline.');
  } else {
    toast('Add to Pipeline first, then approve contact to start.');
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
  _syncIntelBanner();
  toast('Reloaded — ' + (state.discoveryQueue || []).length + ' contacts');
}

// Patch renderCommand to also update our new elements
const __origRC = window.renderCommand || function(){};
window.renderCommand = function() {
  __origRC();
  const act = state.leads.filter(l => !['Closed','Archived'].includes(l.status));
  const ev  = calcEV();
  const evEl = document.getElementById('tm-pipeline'); if(evEl) evEl.textContent = '$' + fmtNum(Math.round(ev.base));
  const aEl  = document.getElementById('cmd-active');  if(aEl)  aEl.textContent  = act.length;
  const dEl  = document.getElementById('cmd-decay');   if(dEl)  dEl.textContent  = act.filter(l => decayDays(l) > 1).length;
  const ts   = document.getElementById('cmd-total-sub'); if(ts) ts.textContent   = state.leads.length + ' total in system';
  const md   = document.getElementById('mode-display'); if(md)  md.textContent   = state.autonomyMode || 'SEMI-AUTO';
  _syncIntelBanner();
  _renderCommandCharts();
};

const __origRA = window.renderAll || function(){};
window.renderAll = function() {
  __origRA();
  _syncIntelBanner();
  _renderCommandCharts();
};

// Patch showPage to also render discovery hero when intel tab opens
const __origSP = window.showPage || function(){};
window.showPage = function(pageId, btn) {
  __origSP(pageId, btn);
  if(pageId === 'intel') { renderDiscoveryHero(); _syncIntelBanner(); }
  if(pageId === 'command') { _syncIntelBanner(); _renderCommandCharts(); }
};

// Run initial render after everything loaded
window.addEventListener('load', function() {
  _syncIntelBanner();
  _renderCommandCharts();
});
<\/script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Done —', html.split('\n').length, 'lines,', Math.round(html.length/1024) + 'KB');
