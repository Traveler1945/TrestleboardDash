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
  --bg:#08090e;
  --s1:#0f1118;
  --s2:#161922;
  --s3:#1c2030;
  --br:#222638;
  --br2:#2d3248;
  --gold:#e8b84b;
  --gold2:#f5d070;
  --goldfade:#e8b84b18;
  --red:#e03e3e;
  --redfade:#e03e3e18;
  --green:#2ec76e;
  --greenfade:#2ec76e18;
  --blue:#4d8ef0;
  --bluefade:#4d8ef018;
  --purple:#9d60f8;
  --purplefade:#9d60f818;
  --text:#dde0f0;
  --dim:#5a6080;
  --dim2:#7a80a0;
  --r:3px;
}
body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;min-height:100vh;font-size:13px}

/* AUTH */
#auth-gate{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:9999;background-image:radial-gradient(ellipse at 50% 20%,#e8b84b0a 0%,transparent 60%)}
#auth-gate.hidden{display:none}
.auth-box{background:var(--s1);border:2px solid var(--gold);padding:52px 60px;width:400px;text-align:center}
.auth-title{font-size:28px;letter-spacing:8px;color:var(--gold);font-weight:bold;margin-bottom:6px}
.auth-sub{font-size:9px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;margin-bottom:32px}
.auth-box input{width:100%;background:var(--s2);border:2px solid var(--br2);color:var(--text);padding:16px;font-family:inherit;font-size:20px;text-align:center;letter-spacing:8px;margin-bottom:12px}
.auth-box input:focus{outline:none;border-color:var(--gold)}
.auth-btn{width:100%;background:var(--gold);border:none;color:#000;padding:16px;font-family:inherit;font-size:13px;letter-spacing:4px;text-transform:uppercase;cursor:pointer;font-weight:bold}
.auth-btn:hover{background:var(--gold2)}
.auth-error{color:var(--red);font-size:10px;margin-top:10px;min-height:16px;letter-spacing:1px}

/* BUILD BAR */
#build-bar{background:#000;border-bottom:1px solid var(--br);padding:5px 20px;display:flex;align-items:center;justify-content:space-between;font-size:9px;color:var(--dim);letter-spacing:1px;position:sticky;top:0;z-index:200}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;animation:blink 2s infinite;margin-right:6px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* TOPBAR */
.topbar{background:var(--s1);border-bottom:2px solid var(--br);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:26px;z-index:100}
.logo{font-size:18px;font-weight:bold;color:var(--gold);letter-spacing:6px}
.logo-sub{font-size:8px;color:var(--dim);letter-spacing:2px;margin-top:3px}
.mode-strip{display:flex;align-items:center;gap:6px}
.mode-label-txt{font-size:9px;color:var(--dim);letter-spacing:1px;text-transform:uppercase}
.mbtn{background:transparent;border:1px solid var(--br2);color:var(--dim);padding:6px 14px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit}
.mbtn.manual.on{border-color:var(--blue);color:var(--blue);background:var(--bluefade)}
.mbtn.semi.on{border-color:var(--gold);color:var(--gold);background:var(--goldfade)}
.mbtn.full.on{border-color:var(--green);color:var(--green);background:var(--greenfade)}
.top-clock{font-size:10px;color:var(--dim)}

/* TAB NAV */
.tabs{display:flex;background:var(--s1);border-bottom:2px solid var(--br)}
.tab{flex:1;background:transparent;border:none;border-bottom:3px solid transparent;padding:16px 8px;font-family:inherit;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--dim);cursor:pointer;transition:all .15s}
.tab:hover{color:var(--text)}
.tab.on{color:var(--gold);border-bottom-color:var(--gold);background:var(--goldfade)}
.tab-badge{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:var(--red);color:#fff;font-size:9px;font-weight:bold;margin-left:6px;animation:blink 1.5s infinite}
.tab-badge.gold{background:var(--gold);color:#000}

/* PAGES */
.page{display:none}
.page.on{display:block}

/* ========== COMMAND PAGE ========== */
/* Alert banner when intel is waiting */
.alert-bar{display:none;background:var(--goldfade);border-bottom:2px solid var(--gold);padding:14px 20px;cursor:pointer}
.alert-bar.show{display:flex;align-items:center;justify-content:space-between}
.alert-bar-text{font-size:13px;color:var(--gold);letter-spacing:1px}
.alert-bar-sub{font-size:10px;color:var(--dim2);margin-top:2px}
.alert-bar-cta{background:var(--gold);color:#000;padding:8px 20px;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;cursor:pointer;border:none;font-family:inherit}

/* 4 big stat boxes */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--br)}
.stat-box{background:var(--s1);padding:24px 16px;text-align:center;position:relative}
.stat-box::after{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.stat-box.ev::after{background:var(--gold)}
.stat-box.leads::after{background:var(--green)}
.stat-box.risk::after{background:var(--red)}
.stat-box.intel::after{background:var(--purple)}
.stat-num{font-size:36px;font-weight:bold;line-height:1;margin-bottom:6px}
.stat-box.ev .stat-num{color:var(--gold)}
.stat-box.leads .stat-num{color:var(--green)}
.stat-box.risk .stat-num{color:var(--red)}
.stat-box.intel .stat-num{color:var(--purple)}
.stat-name{font-size:9px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:3px}
.stat-hint{font-size:9px;color:var(--dim);margin-top:4px}

/* Command split */
.cmd-split{display:grid;grid-template-columns:1fr 320px;background:var(--bg)}
.cmd-main{padding:20px;border-right:1px solid var(--br)}
.cmd-side{padding:20px;background:var(--s1)}
.blk-label{font-size:9px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid var(--br)}

/* Priority target rows */
.target-row{background:var(--s1);border-left:3px solid var(--br2);padding:13px 15px;margin-bottom:8px;cursor:pointer;transition:border-color .15s}
.target-row:hover{border-left-color:var(--gold)}
.target-row.crit{border-left-color:var(--red)}
.target-row.high{border-left-color:var(--gold)}
.target-row.med{border-left-color:var(--green)}
.target-name{font-size:14px;font-weight:bold;margin-bottom:3px}
.target-org{font-size:10px;color:var(--dim2);margin-bottom:5px}
.target-action{font-size:10px;color:var(--blue)}
.target-pills{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}

/* Mini charts */
.chart-box{background:var(--s2);padding:12px;margin-bottom:12px}
.chart-label{font-size:9px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}

/* Empty guide */
.guide-box{text-align:center;padding:48px 20px;color:var(--dim)}
.guide-title{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:var(--dim2);margin-bottom:10px}
.guide-text{font-size:11px;line-height:1.7;margin-bottom:20px}

/* ========== PIPELINE PAGE ========== */
.pipe-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--br);background:var(--s1)}
.view-toggle{display:flex;gap:4px}
.vtab{background:transparent;border:1px solid var(--br2);color:var(--dim);padding:7px 16px;font-size:9px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:inherit}
.vtab.on{background:var(--goldfade);border-color:var(--gold);color:var(--gold)}
.pipe-view{display:none;padding:20px}
.pipe-view.on{display:block}

/* Kanban */
.kanban{display:flex;gap:8px;overflow-x:auto;padding-bottom:12px}
.k-col{min-width:165px;flex:1;background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--br2)}
.k-col-head{padding:10px 12px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between;align-items:center}
.k-col-name{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--dim)}
.k-col-n{font-size:9px;color:var(--dim)}
.k-col-body{padding:6px;min-height:80px}
.kanban-card{background:var(--s2);border-left:3px solid var(--br2);padding:10px;margin-bottom:6px;cursor:grab;transition:border-color .15s}
.kanban-card:hover{border-left-color:var(--gold)}
.kanban-card.dragging{opacity:.3}
.kanban-card.decay-hot{border-left-color:var(--red)}
.kanban-card.decay-warn{border-left-color:var(--gold)}
.kanban-card.decay-ok{border-left-color:var(--green)}
.k-col.drag-over{background:var(--goldfade);border-color:var(--gold)}
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

/* ========== INTEL / DISCOVERY PAGE ========== */
.intel-wrap{max-width:900px;margin:0 auto;padding:20px}
.intel-count{background:var(--goldfade);border:1px solid var(--gold);padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
.ic-num{font-size:28px;font-weight:bold;color:var(--gold)}
.ic-label{font-size:10px;color:var(--dim2);letter-spacing:1px;margin-top:2px}
.ic-reload{background:transparent;border:1px solid var(--br2);color:var(--dim);padding:6px 14px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit}
.ic-reload:hover{border-color:var(--gold);color:var(--gold)}

.vgroup-label{font-size:9px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;padding:8px 0;border-bottom:1px solid var(--br);margin-bottom:8px;margin-top:16px}

/* Contact card */
.ccard{background:var(--s1);border:1px solid var(--br);margin-bottom:8px;overflow:hidden;transition:border-color .15s}
.ccard:hover{border-color:var(--br2)}
.ccard-top{display:flex;align-items:center;gap:14px;padding:14px 16px;cursor:pointer}
.ccard-score{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;border:2px solid;flex-shrink:0}
.cs-high{background:var(--greenfade);border-color:var(--green);color:var(--green)}
.cs-med{background:var(--goldfade);border-color:var(--gold);color:var(--gold)}
.cs-low{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.ccard-info{flex:1;min-width:0}
.ccard-name{font-size:15px;font-weight:bold;margin-bottom:2px}
.ccard-role{font-size:10px;color:var(--dim2);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ccard-org{font-size:11px;color:var(--gold);margin-bottom:2px}
.ccard-loc{font-size:9px;color:var(--dim)}
.ccard-btns{display:flex;flex-direction:column;gap:5px;align-items:flex-end;flex-shrink:0}
.ccard-body{display:none;padding:0 16px 16px;border-top:1px solid var(--br)}
.ccard-body.open{display:block}
.intel-text{background:var(--s2);padding:12px 14px;font-size:11px;color:#b0b5cc;line-height:1.8;margin:12px 0;white-space:pre-wrap;border-left:2px solid var(--br2)}
.ccard-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}

/* ADD BUTTON - big green start pipeline */
.btn-start{background:var(--green);border:none;color:#000;padding:9px 18px;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;cursor:pointer;font-family:inherit;transition:all .15s}
.btn-start:hover{opacity:.85}
.btn-start.locked{background:var(--s2);border:1px solid var(--br2);color:var(--dim);cursor:not-allowed}
.btn-start.locked:hover{opacity:1}

/* FAB */
.fab{position:fixed;bottom:24px;right:24px;background:var(--gold);color:#000;border:none;width:54px;height:54px;border-radius:50%;font-size:26px;cursor:pointer;display:none;align-items:center;justify-content:center;font-weight:bold;z-index:300;transition:all .15s}
.fab.on{display:flex}
.fab:hover{background:var(--gold2)}

/* ACCORDION (for sub-sections in Intel page) */
.acc{margin-top:8px}
.acc-head{display:flex;justify-content:space-between;align-items:center;background:var(--s1);padding:13px 16px;cursor:pointer;border-left:2px solid transparent}
.acc-head:hover{background:var(--s2)}
.acc-head.open{border-left-color:var(--gold)}
.acc-name{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--dim)}
.acc-head.open .acc-name{color:var(--gold)}
.acc-body{display:none;background:var(--s2);padding:20px;border-left:2px solid var(--gold)}

/* BUTTONS */
.btn{background:none;border:1px solid var(--br2);color:var(--text);padding:7px 14px;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:1px;text-transform:uppercase;transition:all .15s}
.btn:hover{border-color:var(--gold);color:var(--gold)}
.btn.g{border-color:var(--gold);color:var(--gold);background:var(--goldfade)}
.btn.g:hover{background:var(--gold);color:#000}
.btn.r{border-color:var(--red);color:var(--red)}
.btn.r:hover{background:var(--red);color:#fff}
.btn.gr{border-color:var(--green);color:var(--green);background:var(--greenfade)}
.btn.gr:hover{background:var(--green);color:#000}
.btn.sm{padding:4px 10px;font-size:9px}
.btn.xs{padding:2px 8px;font-size:9px;letter-spacing:0;text-transform:none}
.btn.link{border:none;color:var(--dim);padding:2px 4px;font-size:9px}
.btn.link:hover{color:var(--gold);background:none;border:none}
.brief-btn{border:1px solid var(--gold);color:var(--gold);background:var(--goldfade);padding:6px 14px;font-size:9px;letter-spacing:1px;cursor:pointer;font-family:inherit;text-transform:uppercase}

/* TAGS / BADGES */
.tag{display:inline-block;padding:2px 7px;font-size:9px;letter-spacing:1px;text-transform:uppercase;border:1px solid}
.tag.amber{background:var(--goldfade);border-color:var(--gold);color:var(--gold)}
.tag.green{background:var(--greenfade);border-color:var(--green);color:var(--green)}
.tag.red{background:var(--redfade);border-color:var(--red);color:var(--red)}
.tag.blue{background:var(--bluefade);border-color:var(--blue);color:var(--blue)}
.tag.gray{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.tag.purple{background:var(--purplefade);border-color:var(--purple);color:var(--purple)}
.tag.warn{background:var(--goldfade);border-color:var(--gold);color:var(--gold)}

.score-badge{display:inline-flex;align-items:center;justify-content:center;width:34px;height:22px;font-size:10px;font-weight:bold;border:1px solid}
.score-hot{background:var(--redfade);border-color:var(--red);color:var(--red)}
.score-warm{background:var(--goldfade);border-color:var(--gold);color:var(--gold)}
.score-cool{background:var(--greenfade);border-color:var(--green);color:var(--green)}
.score-cold{background:var(--s2);border-color:var(--br2);color:var(--dim)}

.priority-badge{padding:2px 8px;border:1px solid;font-size:9px;letter-spacing:1px;text-transform:uppercase}
.priority-critical{background:var(--redfade);border-color:var(--red);color:var(--red)}
.priority-high{background:var(--goldfade);border-color:var(--gold);color:var(--gold)}
.priority-med{background:var(--greenfade);border-color:var(--green);color:var(--green)}
.priority-low{background:var(--s2);border-color:var(--br2);color:var(--dim)}

.hold-badge{background:var(--purplefade);border:1px solid var(--purple);color:var(--purple);padding:2px 7px;font-size:9px;letter-spacing:1px}
.decay-hot{color:var(--red);font-size:9px}
.decay-warn{color:var(--gold);font-size:9px}
.decay-ok{color:var(--green);font-size:9px}
.decay-indicator{font-size:9px}
.info-panel{background:var(--bluefade);border:1px solid var(--blue);border-left:4px solid var(--blue);padding:10px 14px;color:#9ec5ff;font-size:11px;margin-bottom:12px}
.info-panel strong{color:#fff}

/* FORMS */
.form-group{margin-bottom:12px}
label{display:block;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--dim);margin-bottom:4px}
input,textarea,select{width:100%;background:var(--s2);border:1px solid var(--br2);color:var(--text);padding:8px 10px;font-family:inherit;font-size:12px}
input:focus,textarea:focus,select:focus{outline:1px solid var(--gold)}
textarea{resize:vertical;min-height:70px}
select{cursor:pointer}

/* STATS ROW (inside pipeline sections) */
.stats-row{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.stat-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:14px 16px;flex:1;min-width:100px}
.stat-card.warn{border-top-color:var(--gold)}
.stat-card.danger{border-top-color:var(--red)}
.stat-card.success{border-top-color:var(--green)}
.stat-value{font-size:22px;color:var(--gold);font-weight:bold}
.stat-card.danger .stat-value{color:var(--red)}
.stat-card.success .stat-value{color:var(--green)}
.stat-label{font-size:9px;color:var(--dim);letter-spacing:1px;text-transform:uppercase;margin-top:4px}
.stat-sub{font-size:9px;color:var(--dim);margin-top:2px}

.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.section-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}
.section-actions{display:flex;gap:6px;flex-wrap:wrap}

.obj-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:12px 14px;margin-bottom:8px}
.obj-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.obj-type{font-size:11px;color:var(--gold);letter-spacing:1px}
.obj-vertical{font-size:9px;color:var(--dim)}
.obj-counter{font-size:10px;color:#aaa;margin-bottom:6px;line-height:1.5}

.sequence-card{background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:8px}
.sequence-header{display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.sequence-title{font-size:12px;margin-bottom:2px;font-weight:bold}
.sequence-meta{font-size:10px;color:var(--dim)}
.sequence-steps{display:flex;margin-bottom:10px}
.step{flex:1;padding:6px 4px;border:1px solid var(--br);font-size:9px;text-align:center;color:var(--dim);background:var(--s2)}
.step.done{border-color:var(--green);color:var(--green);background:var(--greenfade)}
.step.active{border-color:var(--gold);color:var(--gold);background:var(--goldfade)}
.sequence-actions{display:flex;gap:5px;flex-wrap:wrap}

.queue-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:14px;margin-bottom:8px}
.queue-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.queue-card-title{font-size:12px;margin-bottom:2px;font-weight:bold}
.queue-card-meta{font-size:10px;color:var(--dim)}
.queue-card-body{font-size:11px;color:#999;margin-bottom:8px;line-height:1.5}
.queue-card-actions{display:flex;gap:5px;flex-wrap:wrap}

.meeting-card{background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:8px}
.meeting-header{display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px}

.log-entry{display:flex;gap:12px;padding:6px 0;border-bottom:1px solid var(--br);font-size:10px}
.log-time{color:var(--dim);white-space:nowrap;min-width:130px}
.log-actor{color:var(--gold);min-width:70px}
.log-action{color:var(--text)}

.dossier{background:var(--s2);border:1px solid var(--br);padding:14px;font-size:12px;line-height:1.8}
.dossier h4{color:var(--gold);letter-spacing:1px;text-transform:uppercase;font-size:10px;margin:12px 0 4px;border-bottom:1px solid var(--br);padding-bottom:3px}
.dossier p{color:#aaa}
.score-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.score-row{background:var(--s2);border:1px solid var(--br);padding:6px 10px}
.score-row-label{font-size:9px;color:var(--dim);letter-spacing:1px}
.score-row-val{font-size:13px;color:var(--gold);font-weight:bold;margin-top:2px}

.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:16px}
.agent-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.agent-card h4{font-size:11px;color:var(--gold);letter-spacing:1px;text-transform:uppercase}
.agent-card p{font-size:10px;color:var(--dim);line-height:1.4}
.agent-card .agent-meta{display:flex;justify-content:space-between;font-size:9px;color:var(--dim)}
.agent-conflict{background:var(--redfade);border:1px solid var(--red);color:var(--red);padding:2px 6px;font-size:9px;letter-spacing:1px}

.conflict-list{display:flex;flex-direction:column;gap:8px}
.conflict-item{background:var(--s1);border:1px solid var(--br);padding:10px 12px}
.conflict-item h5{font-size:10px;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.conflict-item p{font-size:10px;color:#aaa;margin-bottom:4px}
.conflict-status{font-size:9px;letter-spacing:1px;text-transform:uppercase}
.conflict-status.pending{color:var(--gold)}
.conflict-status.resolved{color:var(--green)}

.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sim-card{background:var(--s1);border:1px solid var(--br);padding:14px}
.sim-card h4{font-size:10px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:8px}
.sim-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sim-output{margin-top:12px;background:var(--s2);border:1px solid var(--br);padding:12px;font-size:11px;line-height:1.6;color:#cfd6ff;min-height:100px;white-space:pre-wrap}

.constraints-panel{background:var(--s1);border:1px solid var(--br);padding:16px;margin-bottom:12px}
.constraints-panel h4{font-size:10px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
.constraints-panel ol{padding-left:16px;font-size:11px;line-height:1.6;color:#ccc}
.constraints-panel li{margin-bottom:4px}
.constraints-subgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.constraints-subgrid div{background:var(--s2);border:1px solid var(--br);padding:10px;font-size:10px;line-height:1.5}
.constraints-subgrid strong{color:var(--gold);display:block;margin-bottom:3px;letter-spacing:1px}

.forecast-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px}
.forecast-card{background:var(--s1);border:1px solid var(--br);padding:16px;text-align:center}
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

.disc-log{background:var(--bg);border:1px solid var(--br);padding:10px;font-size:10px;max-height:180px;overflow-y:auto;margin-top:12px;color:var(--dim)}
.discovery-toggle{display:flex;gap:6px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
.disc-mode-btn{border:1px solid var(--br2);background:transparent;color:var(--dim);padding:5px 12px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit}
.disc-mode-btn.active-OFF{border-color:var(--dim);color:var(--dim)}
.disc-mode-btn.active-SEARCHING{border-color:var(--green);color:var(--green);background:var(--greenfade)}
.disc-mode-btn.active-PAUSED{border-color:var(--gold);color:var(--gold);background:var(--goldfade)}

.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chart-card{background:var(--s1);border:1px solid var(--br);padding:16px}
.chart-card-title{font-size:9px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.chart-card.full{grid-column:span 2}

/* MODALS */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;align-items:center;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:var(--s1);border:2px solid var(--gold);width:540px;max-width:95vw;max-height:90vh;overflow-y:auto}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--br)}
.modal-title{color:var(--gold);letter-spacing:2px;text-transform:uppercase;font-size:11px}
.modal-close{background:none;border:none;color:var(--dim);cursor:pointer;font-size:18px}
.modal-body{padding:18px}
.modal-footer{padding:12px 18px;border-top:1px solid var(--br);display:flex;gap:6px;justify-content:flex-end}

#toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--s1);border:1px solid var(--gold);color:var(--gold);padding:10px 22px;font-size:11px;letter-spacing:1px;z-index:9999;display:none}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--br2)}
::-webkit-scrollbar-thumb:hover{background:var(--dim)}

@media(max-width:768px){
  .stat-grid{grid-template-columns:1fr 1fr}
  .cmd-split{grid-template-columns:1fr}
  .chart-grid{grid-template-columns:1fr}
  .chart-card.full{grid-column:span 1}
  .forecast-grid{grid-template-columns:1fr}
  .sim-grid{grid-template-columns:1fr}
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
    <span>LAST UPDATED: <strong id="build-ts" style="color:var(--gold)">loading...</strong></span>
  </div>
  <span id="current-time"></span>
</div>

<!-- TOPBAR -->
<div class="topbar">
  <div>
    <div class="logo">TRESTLEBOARD</div>
    <div class="logo-sub">REVENUE OPERATIONS SYSTEM</div>
  </div>
  <div class="mode-strip">
    <span class="mode-label-txt">MODE</span>
    <div id="mode-selector">
      <button class="mbtn manual" data-mode="MANUAL" onclick="setAutonomyMode('MANUAL')">MANUAL</button>
      <button class="mbtn semi" data-mode="SEMI-AUTO" onclick="setAutonomyMode('SEMI-AUTO')">SEMI</button>
      <button class="mbtn full" data-mode="FULL AUTO" onclick="setAutonomyMode('FULL AUTO')">FULL</button>
    </div>
    <button class="brief-btn" onclick="openStrategicBrief()">BRIEF</button>
  </div>
</div>

<!-- TABS -->
<div class="tabs">
  <button class="tab on" onclick="showPage('command',this)">COMMAND</button>
  <button class="tab" onclick="showPage('pipeline',this)">PIPELINE</button>
  <button class="tab" onclick="showPage('intel',this)">
    INTEL <span class="tab-badge gold" id="nav-intel-badge" style="display:none">0</span>
  </button>
</div>

<!-- ================== COMMAND ================== -->
<div class="page on" id="page-command">

  <!-- Intel alert bar -->
  <div class="alert-bar" id="intel-bar" onclick="showPage('intel', document.querySelector('.tab:nth-child(3)'))">
    <div>
      <div class="alert-bar-text" id="intel-bar-text">CONTACTS WAITING FOR REVIEW</div>
      <div class="alert-bar-sub" id="intel-bar-sub">Tap to open Intel and review discovered contacts</div>
    </div>
    <button class="alert-bar-cta">REVIEW NOW</button>
  </div>

  <!-- 4 stat boxes -->
  <div class="stat-grid">
    <div class="stat-box ev">
      <div class="stat-name">Pipeline Value</div>
      <div class="stat-num" id="tm-pipeline">$0</div>
      <div class="stat-hint">Expected revenue</div>
    </div>
    <div class="stat-box leads">
      <div class="stat-name">Active Leads</div>
      <div class="stat-num" id="cmd-active">0</div>
      <div class="stat-hint" id="cmd-total-sub">in pipeline</div>
    </div>
    <div class="stat-box risk">
      <div class="stat-name">Need Attention</div>
      <div class="stat-num" id="cmd-decay">0</div>
      <div class="stat-hint">Cold or stale</div>
    </div>
    <div class="stat-box intel">
      <div class="stat-name">Intel Waiting</div>
      <div class="stat-num" id="cmd-intel-count">0</div>
      <div class="stat-hint">Contacts to review</div>
    </div>
  </div>

  <!-- Split layout -->
  <div class="cmd-split">
    <div class="cmd-main">
      <div class="blk-label">PRIORITY TARGETS — WHAT TO DO NEXT</div>
      <div id="cmd-hot-leads">
        <div class="guide-box">
          <div class="guide-title">No leads in pipeline yet</div>
          <div class="guide-text">You have contacts waiting in your Intel tab.<br>Go there, review them, and add the ones you like to your pipeline.</div>
          <button class="btn g" onclick="showPage('intel',document.querySelector('.tab:nth-child(3)'))">GO TO INTEL</button>
        </div>
      </div>
    </div>
    <div class="cmd-side">
      <div class="blk-label">PIPELINE OVERVIEW</div>
      <div class="chart-box">
        <div class="chart-label">LEADS BY STAGE</div>
        <canvas id="mini-funnel-chart" height="120"></canvas>
      </div>
      <div class="chart-box">
        <div class="chart-label">LEAD HEALTH</div>
        <canvas id="mini-decay-chart" height="90"></canvas>
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
  <div id="alert-container"></div>
  <div id="cmd-forecast-mini" style="display:none"></div>
  <div id="cmd-objections-mini" style="display:none"></div>
  <div id="constraints-banner" style="display:none"></div>
</div>

<!-- ================== PIPELINE ================== -->
<div class="page" id="page-pipeline">
  <div class="pipe-header">
    <div class="view-toggle">
      <button class="vtab on" onclick="showPipelineView('kanban',this)">BOARD</button>
      <button class="vtab" onclick="showPipelineView('table',this)">LIST</button>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn sm" onclick="exportLeads()">EXPORT</button>
      <button class="btn g sm" onclick="openAddLead()">+ ADD LEAD</button>
    </div>
  </div>
  <div class="pipe-view on" id="pview-kanban">
    <div class="kanban" id="kanban-board"></div>
  </div>
  <div class="pipe-view" id="pview-table">
    <table>
      <thead><tr>
        <th>Score</th><th>Name</th><th>Org</th><th>Vertical</th>
        <th>Stage</th><th>Decay</th><th>Priority</th><th>Next Action</th>
        <th>Profile</th><th>Value</th><th>Contact</th><th>Actions</th>
      </tr></thead>
      <tbody id="lead-tbody"></tbody>
    </table>
  </div>
  <button class="fab on" id="fab-add" onclick="openAddLead()">+</button>
</div>

<!-- ================== INTEL ================== -->
<div class="page" id="page-intel">
  <div class="intel-wrap">

    <!-- Discovery contacts — hero section -->
    <div id="discovery-hero"></div>

    <!-- Other tools as accordion -->
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)">
        <span class="acc-name">ANALYTICS</span><span style="color:var(--dim);font-size:10px">+</span>
      </div>
      <div class="acc-body"><div id="section-analytics-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)">
        <span class="acc-name">REVENUE FORECAST</span><span style="color:var(--dim);font-size:10px">+</span>
      </div>
      <div class="acc-body">
        <div class="section-header"><div class="section-title">Revenue Forecast</div><div class="section-actions"><button class="btn sm" onclick="renderForecast()">Recalculate</button></div></div>
        <div class="forecast-grid">
          <div class="forecast-card conservative"><div class="forecast-val" id="fc-conservative">$0</div><div class="forecast-label">Conservative</div><div class="forecast-desc">P(close) x 0.7</div></div>
          <div class="forecast-card base"><div class="forecast-val" id="fc-base">$0</div><div class="forecast-label">Base Case</div></div>
          <div class="forecast-card upside"><div class="forecast-val" id="fc-upside">$0</div><div class="forecast-label">Upside</div><div class="forecast-desc">P(close) x 1.3</div></div>
        </div>
        <div id="pipeline-bars"></div>
        <table><thead><tr><th>Lead</th><th>Stage</th><th>Score</th><th>Value</th><th>P(Close)</th><th>Mult</th><th>EV</th></tr></thead><tbody id="forecast-tbody"></tbody></table>
      </div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">SIMULATION</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-simulation-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">CAMPAIGNS</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-outreach-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">CONTENT QUEUE</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-content-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">OBJECTIONS</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-objections-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">MEETINGS</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-meetings-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">AGENTS</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-agents-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">RULES</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-constraints-inner"></div></div>
    </div>
    <div class="acc">
      <div class="acc-head" onclick="toggleAcc(this)"><span class="acc-name">AUDIT LOG</span><span style="color:var(--dim);font-size:10px">+</span></div>
      <div class="acc-body"><div id="section-auditlog-inner"></div></div>
    </div>
  </div>
</div>

${modals}
<div id="toast"></div>

<script src="data.js"><\/script>
<script>
// NAVIGATION
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  const pg = document.getElementById('page-'+id);
  if(pg) pg.classList.add('on');
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  if(btn) btn.classList.add('on');
  const fab = document.getElementById('fab-add');
  if(fab) fab.classList.toggle('on', id==='pipeline');
  if(id==='pipeline'){renderKanban();renderLeadTable();}
  if(id==='intel'){mountIntelSections();renderAnalytics();renderDiscoveryHero();}
  if(id==='command'){renderCommandCharts();updateIntelBanner();}
}
function showPipelineView(v, btn) {
  document.querySelectorAll('.pipe-view').forEach(x=>x.classList.remove('on'));
  const el=document.getElementById('pview-'+v);
  if(el)el.classList.add('on');
  document.querySelectorAll('.view-toggle .vtab').forEach(t=>t.classList.remove('on'));
  if(btn)btn.classList.add('on');
  if(v==='table')renderLeadTable();
  if(v==='kanban')renderKanban();
}
function toggleAcc(hd) {
  const open=hd.classList.contains('open');
  document.querySelectorAll('.acc-head').forEach(h=>{h.classList.remove('open');if(h.nextElementSibling)h.nextElementSibling.style.display='none';});
  if(!open){hd.classList.add('open');if(hd.nextElementSibling)hd.nextElementSibling.style.display='block';}
}
// legacy shims
function showSection(){}
function toggleIntelPanel(h){toggleAcc(h);}
function accordion_open(h){toggleAcc(h);}

// INTEL BANNER
function updateIntelBanner() {
  const q = state.discoveryQueue||[];
  const bar=document.getElementById('intel-bar');
  const badge=document.getElementById('nav-intel-badge');
  const count=document.getElementById('cmd-intel-count');
  const txt=document.getElementById('intel-bar-text');
  const sub=document.getElementById('intel-bar-sub');
  if(q.length>0){
    if(bar)bar.classList.add('show');
    if(badge){badge.style.display='inline-flex';badge.textContent=q.length;}
    if(count)count.textContent=q.length;
    if(txt)txt.textContent=q.length+' CONTACTS WAITING FOR REVIEW';
    if(sub)sub.textContent='Go to Intel to review, expand any card, then add to pipeline.';
  } else {
    if(bar)bar.classList.remove('show');
    if(badge)badge.style.display='none';
    if(count)count.textContent='0';
  }
}

// INTEL SECTIONS MOUNT
let _mounted=false;
function mountIntelSections(){
  if(_mounted)return;
  _mounted=true;
  renderObjections();renderMeetings();renderCampaigns();renderContent();
  renderAgents();renderAuditLog();renderConstraintsList();renderForecast();
  initSimulationForm();renderAnalytics();
}

// DISCOVERY HERO RENDER
function renderDiscoveryHero(){
  const el=document.getElementById('discovery-hero');
  if(!el)return;
  const q=state.discoveryQueue||[];
  if(!q.length){
    el.innerHTML='<div class="guide-box"><div class="guide-title">NO INTEL YET</div><div class="guide-text">Your discovery queue is empty. Reload to restore contacts.</div><button class="btn g" onclick="resetAndReloadAllLeads()">RELOAD CONTACTS</button></div>';
    return;
  }
  // group by vertical
  const vmap={};
  q.forEach(item=>{const v=item.vertical||'Other';if(!vmap[v])vmap[v]=[];vmap[v].push(item);});
  let html='<div class="intel-count"><div><div class="ic-num">'+q.length+'</div><div class="ic-label">VERIFIED CONTACTS IN QUEUE</div></div><button class="ic-reload" onclick="resetAndReloadAllLeads()">RELOAD ALL</button></div>';
  Object.entries(vmap).forEach(([v,items])=>{
    html+='<div class="vgroup-label">'+v+' ('+items.length+')</div>';
    items.forEach(item=>{
      const cc=item.confidence>=85?'cs-high':item.confidence>=70?'cs-med':'cs-low';
      const lines=(item.intel||'').split('\\n');
      const firstLine=lines[0]||'';
      const emailLine=lines.find(l=>l.toLowerCase().includes('email'))||'';
      const liLine=lines.find(l=>l.toLowerCase().includes('linkedin'))||'';
      const locLine=item.location||lines.find(l=>l.includes('FL')||l.includes('VA')||l.includes('DC')||l.includes('MD'))||'';
      const emailMatch=emailLine.match(/:\\s*([^\\s(]+@[^\\s]+)/);
      const emailVal=emailMatch?emailMatch[1].trim():'';
      const liMatch=liLine.match(/(linkedin\\.com\\/in\\/[^\\s]+)/i);
      const liVal=liMatch?liMatch[1]:'';
      html+='<div class="ccard" id="card-'+item.id+'">';
      html+='<div class="ccard-top" onclick="toggleCard(\\'' +item.id+ '\\')">';
      html+='<div class="ccard-score '+cc+'">'+item.confidence+'%</div>';
      html+='<div class="ccard-info"><div class="ccard-name">'+(item.name||'Unknown')+'</div>';
      html+='<div class="ccard-role">'+firstLine.substring(0,70)+'</div>';
      html+='<div class="ccard-org">'+(item.org||'')+'</div>';
      if(locLine)html+='<div class="ccard-loc">'+locLine+'</div>';
      html+='</div>';
      html+='<div class="ccard-btns">';
      if(emailVal)html+='<a href="mailto:'+emailVal+'" class="btn xs g" onclick="event.stopPropagation()">EMAIL</a>';
      if(liVal)html+='<a href="https://'+liVal+'" target="_blank" class="btn xs" onclick="event.stopPropagation()">LINKEDIN</a>';
      html+='</div>';
      html+='</div>';
      html+='<div class="ccard-body" id="body-'+item.id+'">';
      html+='<div class="intel-text">'+(item.intel||'').replace(/</g,'&lt;')+'</div>';
      html+='<div class="ccard-actions">';
      html+='<button class="btn gr sm" onclick="importDiscoveryLead(\\'' +item.id+ '\\')">ADD TO PIPELINE</button>';
      html+='<button class="btn-start locked" onclick="handlePipelineStart(\\'' +item.id+ '\\')">START PIPELINE</button>';
      html+='<button class="btn r sm" onclick="dismissDiscoveryLead(\\'' +item.id+ '\\')">DISMISS</button>';
      html+='</div></div></div>';
    });
  });
  el.innerHTML=html;
}

function toggleCard(id){
  const b=document.getElementById('body-'+id);
  if(b)b.classList.toggle('open');
}
function handlePipelineStart(discId){
  const qItem=(state.discoveryQueue||[]).find(x=>x.id===discId);
  const lead=state.leads.find(l=>l.name===(qItem&&qItem.name));
  if(lead&&lead.contactApproved){
    toast('Pipeline started for '+lead.name);
    log('PIPELINE START','Lead: '+lead.name);
  } else if(lead){
    toast('LOCKED — Go to Pipeline, open this lead, then approve contact.');
  } else {
    toast('Add to Pipeline first, then approve contact to start.');
  }
}
function resetAndReloadAllLeads(){
  localStorage.removeItem('claw_intel_v1');
  localStorage.removeItem('claw_apollo_v1');
  localStorage.removeItem('claw_sf_v1');
  state.discoveryQueue=[];
  loadAgentIntel();loadApolloLeads();loadSouthFloridaLeads();
  renderDiscoveryHero();updateIntelBanner();
  toast('Reloaded — '+(state.discoveryQueue||[]).length+' contacts');
}

// MINI CHARTS
let mFC=null,mDC=null;
function renderCommandCharts(){
  const sl=window.CLAW.CONFIG.STAGES;
  const sc=sl.map(s=>state.leads.filter(l=>l.status===s).length);
  const fe=document.getElementById('mini-funnel-chart');
  if(fe&&window.Chart){if(mFC)mFC.destroy();mFC=new Chart(fe,{type:'bar',data:{labels:sl,datasets:[{data:sc,backgroundColor:'#e8b84b33',borderColor:'#e8b84b',borderWidth:1}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#5a6080',font:{size:9}},grid:{color:'#222638'}},y:{ticks:{color:'#5a6080',font:{size:9}},grid:{display:false}}}}});}
  const ac=state.leads.filter(l=>l.status!=='Archived');
  const fr=ac.filter(l=>decayDays(l)<=1).length;
  const wn=ac.filter(l=>decayDays(l)>1&&decayDays(l)<=3).length;
  const cr=ac.filter(l=>decayDays(l)>3).length;
  const de=document.getElementById('mini-decay-chart');
  if(de&&window.Chart){if(mDC)mDC.destroy();mDC=new Chart(de,{type:'doughnut',data:{labels:['Good','Watch','Cold'],datasets:[{data:[fr||1,wn,cr],backgroundColor:['#2ec76e33','#e8b84b33','#e03e3e33'],borderColor:['#2ec76e','#e8b84b','#e03e3e'],borderWidth:1}]},options:{cutout:'65%',plugins:{legend:{labels:{color:'#5a6080',font:{size:9},boxWidth:10}}}}});}
}

// BUILD TIMESTAMP
const _BUILD='${BUILD_TIME}';
document.addEventListener('DOMContentLoaded',function(){
  const el=document.getElementById('build-ts');
  if(el){const d=new Date(_BUILD);el.textContent=d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})+' ET';}
});

${mainJS}

// PATCH renderCommand
const __rc=renderCommand;
renderCommand=function(){
  __rc();
  const act=state.leads.filter(l=>!['Closed','Archived'].includes(l.status));
  const ev=calcEV();
  const evEl=document.getElementById('tm-pipeline');if(evEl)evEl.textContent='$'+fmtNum(Math.round(ev.base));
  const aEl=document.getElementById('cmd-active');if(aEl)aEl.textContent=act.length;
  const dEl=document.getElementById('cmd-decay');if(dEl)dEl.textContent=act.filter(l=>decayDays(l)>1).length;
  const ts=document.getElementById('cmd-total-sub');if(ts)ts.textContent=state.leads.length+' total in system';
  updateIntelBanner();renderCommandCharts();
};
const __ra=renderAll;
renderAll=function(){__ra();updateIntelBanner();renderCommandCharts();updateConflictBadge();};
function updateConflictBadge(){
  const p=(state.conflicts||[]).filter(c=>c.status==='pending').length;
  const b=document.getElementById('nav-conflict-badge');
  if(b){b.textContent=p;b.style.display=p?'inline-flex':'none';}
}
<\/script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Done —', html.split('\n').length, 'lines,', Math.round(html.length/1024)+'KB');
