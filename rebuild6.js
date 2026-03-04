// rebuild6.js — One-screen factory game HUD
const fs  = require('fs');
const js  = fs.readFileSync('_orig_js.js', 'utf8');
const BT  = new Date().toISOString();

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
  --bg:#060709;--s1:#0b0d14;--s2:#10131c;--s3:#161a26;
  --br:#1c2030;--br2:#252d42;--br3:#2e3850;
  --gold:#e8b84b;--gold2:#f5d46a;--gf:#e8b84b14;--gfb:#e8b84b28;
  --red:#e03535;--rf:#e0353514;
  --green:#1fc45e;--grF:#1fc45e14;--grFb:#1fc45e28;
  --blue:#3d7fe8;--bF:#3d7fe814;
  --purple:#8b4cf7;--pF:#8b4cf714;
  --cyan:#22d3d3;--cyF:#22d3d314;
  --text:#cdd0e0;--muted:#404860;--muted2:#606888;
}

/* ── SCANLINE OVERLAY ── */
body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;font-size:12px;overflow:hidden;height:100vh;display:flex;flex-direction:column}
body::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.06) 3px,rgba(0,0,0,.06) 4px);pointer-events:none;z-index:9000}

/* GRID BACKGROUND */
.hud-bg{
  background-image:
    linear-gradient(rgba(232,184,75,.025) 1px,transparent 1px),
    linear-gradient(90deg,rgba(232,184,75,.025) 1px,transparent 1px);
  background-size:48px 48px;
}

/* ── AUTH ── */
#auth-gate{position:fixed;inset:0;background:rgba(6,7,9,.97);display:flex;align-items:center;justify-content:center;z-index:9999;
  background-image:linear-gradient(rgba(232,184,75,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(232,184,75,.04) 1px,transparent 1px);
  background-size:48px 48px}
#auth-gate.hidden{display:none!important}
.auth-box{border:2px solid var(--gold);padding:48px 56px;width:380px;text-align:center;background:var(--s1);
  box-shadow:0 0 60px rgba(232,184,75,.12),inset 0 0 40px rgba(0,0,0,.4)}
.auth-logo{font-size:20px;letter-spacing:8px;color:var(--gold);font-weight:bold;margin-bottom:4px;text-shadow:0 0 20px rgba(232,184,75,.5)}
.auth-tagline{font-size:8px;color:var(--muted2);letter-spacing:3px;text-transform:uppercase;margin-bottom:28px}
.auth-div{display:none}
.auth-box input[type="password"]{width:100%;background:var(--bg);border:2px solid var(--br3);color:var(--text);padding:14px;
  font-family:inherit;font-size:18px;text-align:center;letter-spacing:6px;margin-bottom:10px}
.auth-box input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 12px rgba(232,184,75,.3)}
.auth-btn{width:100%;background:var(--gold);border:none;color:#000;padding:14px;font-family:inherit;
  font-size:11px;letter-spacing:4px;text-transform:uppercase;cursor:pointer;font-weight:bold}
.auth-btn:hover{background:var(--gold2)}
.auth-error{color:var(--red);font-size:9px;margin-top:10px;min-height:14px;letter-spacing:1px}

/* ── BUILD BAR ── */
#build-bar{background:#000;border-bottom:1px solid var(--br);padding:4px 16px;display:flex;align-items:center;justify-content:space-between;font-size:9px;color:var(--muted2);letter-spacing:1px;flex-shrink:0}
.live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);margin-right:5px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 4px var(--green)}50%{opacity:.4;box-shadow:none}}

/* ── HEADER ── */
.header{background:var(--s1);border-bottom:2px solid var(--br);padding:8px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.logo{font-size:15px;font-weight:bold;color:var(--gold);letter-spacing:5px;text-shadow:0 0 12px rgba(232,184,75,.4)}
.logo-sub{font-size:7px;color:var(--muted2);letter-spacing:2px;margin-top:2px}
.mode-strip{display:flex;align-items:center;gap:5px}
.mode-btn{background:transparent;border:1px solid var(--br2);color:var(--muted2);padding:5px 11px;font-size:8px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit;transition:all .15s}
.mode-btn.active,.mode-btn.semi.active{border-color:var(--gold);color:var(--gold);background:var(--gf);box-shadow:0 0 8px rgba(232,184,75,.2)}
.mode-btn.manual.active{border-color:var(--blue);color:var(--blue);background:var(--bF)}
.mode-btn.full.active{border-color:var(--green);color:var(--green);background:var(--grF)}
.brief-btn{border:1px solid var(--gold);color:var(--gold);background:var(--gf);padding:5px 11px;font-size:8px;letter-spacing:1px;cursor:pointer;font-family:inherit;text-transform:uppercase}
.brief-btn:hover{background:var(--gold);color:#000}

/* ── RESOURCE BAR (4 stat counters) ── */
.resource-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--br);border-bottom:1px solid var(--br);flex-shrink:0}
.resource{background:var(--s1);padding:8px 14px;display:flex;align-items:center;gap:10px;position:relative;overflow:hidden}
.resource::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%}
.resource.ev::before{background:var(--gold)}
.resource.active::before{background:var(--green)}
.resource.risk::before{background:var(--red)}
.resource.intel::before{background:var(--purple)}
.res-num{font-size:24px;font-weight:bold;line-height:1;font-family:'Courier New',monospace}
.resource.ev .res-num{color:var(--gold);text-shadow:0 0 10px rgba(232,184,75,.3)}
.resource.active .res-num{color:var(--green);text-shadow:0 0 10px rgba(31,196,94,.3)}
.resource.risk .res-num{color:var(--red)}
.resource.intel .res-num{color:var(--purple);text-shadow:0 0 10px rgba(139,76,247,.3)}
.res-label{font-size:8px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-top:2px}
.res-sub{font-size:7px;color:var(--muted);margin-top:1px}
.res-icon{font-size:18px;color:var(--muted);flex-shrink:0}

/* ── MAIN HUD BODY ── */
.hud-body{flex:1;display:grid;grid-template-rows:auto 1fr;min-height:0;overflow:hidden}

/* ── CONVEYOR BELT (pipeline) ── */
.conveyor-section{border-bottom:2px solid var(--br);background:var(--s1);flex-shrink:0;position:relative}
.conveyor-label{font-size:7px;color:var(--muted2);letter-spacing:3px;text-transform:uppercase;padding:5px 16px 0;display:flex;align-items:center;gap:8px}
.conveyor-label::after{content:'';flex:1;height:1px;background:var(--br2)}
.conveyor-arrow{color:var(--gold);font-size:9px;animation:arrowPulse 1.5s infinite}
@keyframes arrowPulse{0%,100%{opacity:1}50%{opacity:.3}}
/* The actual kanban board styled as conveyor */
.kanban{display:flex;gap:2px;padding:8px 16px 10px;overflow-x:auto;background:transparent}
.kanban-col{min-width:150px;flex:1;background:var(--bg);border:1px solid var(--br2);border-top:2px solid var(--muted);position:relative}
.kanban-col:first-child{border-top-color:var(--blue)}
.kanban-col:nth-child(2){border-top-color:var(--cyan)}
.kanban-col:nth-child(3){border-top-color:var(--gold)}
.kanban-col:nth-child(4){border-top-color:var(--purple)}
.kanban-col:last-child{border-top-color:var(--green)}
.kanban-col-header{padding:6px 8px;border-bottom:1px solid var(--br2);display:flex;justify-content:space-between;align-items:center;background:var(--s2)}
.kanban-col-title{font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2)}
.kanban-col-count{font-size:9px;font-weight:bold;color:var(--muted2);background:var(--br2);padding:1px 5px}
.kanban-col-body{padding:4px;min-height:90px;max-height:130px;overflow-y:auto}
/* Conveyor belt animation under empty columns */
.kanban-col-body:empty::before{content:'';display:block;height:8px;margin:4px 0;background:repeating-linear-gradient(90deg,transparent 0,transparent 8px,var(--br2) 8px,var(--br2) 10px);animation:belt .8s linear infinite;opacity:.4}
@keyframes belt{0%{background-position:0 0}100%{background-position:20px 0}}

.kanban-card{background:var(--s2);border-left:3px solid var(--muted);padding:7px 8px;margin-bottom:3px;cursor:grab;transition:border-left-color .1s;border-bottom:1px solid var(--br)}
.kanban-card:hover{border-left-color:var(--gold);background:var(--s3)}
.kanban-card.dragging{opacity:.3}
.kanban-card.decay-hot{border-left-color:var(--red)}
.kanban-card.decay-warn{border-left-color:var(--gold)}
.kanban-card.decay-ok{border-left-color:var(--green)}
.kanban-col.drag-over{background:var(--gf);border-color:var(--gold)}
.card-name{font-size:11px;font-weight:bold;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-org{font-size:8px;color:var(--muted2);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-score-bar{height:2px;background:var(--br);margin-bottom:2px;overflow:hidden}
.card-score-fill{height:100%}
.card-score-label{font-size:7px;color:var(--muted);margin-bottom:2px}
.card-actions{display:flex;gap:2px;flex-wrap:wrap}

/* ── BOTTOM PANELS ── */
.bottom-panels{display:grid;grid-template-columns:1fr 320px;gap:1px;background:var(--br);min-height:0;overflow:hidden}

/* INTEL QUEUE PANEL */
.intel-panel{background:var(--bg);display:flex;flex-direction:column;min-height:0;overflow:hidden}
.panel-header{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;border-bottom:1px solid var(--br2);background:var(--s1);flex-shrink:0}
.panel-title{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:6px}
.panel-count{background:var(--gold);color:#000;font-size:8px;font-weight:bold;padding:1px 5px;letter-spacing:1px}
.panel-actions{display:flex;gap:4px}
.intel-queue{flex:1;overflow-y:auto;padding:6px}

/* CONTACT ROW (compact intel card) */
.crow{display:grid;grid-template-columns:34px 1fr auto;gap:6px;align-items:center;padding:7px 8px;margin-bottom:2px;background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--muted);cursor:pointer;transition:all .1s}
.crow:hover{border-color:var(--br3);background:var(--s2)}
.crow.expanded-row{border-left-color:var(--gold);background:var(--s2)}
.cconf{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;border:1px solid;flex-shrink:0;text-align:center}
.ch{background:var(--grFb);border-color:var(--green);color:var(--green)}
.cm{background:var(--gfb);border-color:var(--gold);color:var(--gold)}
.cl{background:var(--s2);border-color:var(--br2);color:var(--muted2)}
.cinfo{min-width:0}
.cname{font-size:11px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.crole{font-size:8px;color:var(--muted2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.corg{font-size:9px;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cloc{font-size:7px;color:var(--muted)}
.crow-btns{display:flex;flex-direction:column;gap:2px;flex-shrink:0}
.crow-detail{display:none;padding:7px 8px 9px;background:var(--s2);border:1px solid var(--br);border-top:none;border-left:3px solid var(--gold);margin-bottom:2px}
.crow-detail.open{display:block}
.crow-intel{font-size:9px;color:#a0a5c0;line-height:1.7;white-space:pre-wrap;margin-bottom:7px;max-height:100px;overflow-y:auto;background:var(--bg);padding:6px;border:1px solid var(--br)}
.crow-foot{display:flex;gap:4px;flex-wrap:wrap}

/* RIGHT PANEL (Priority + Log) */
.right-panel{background:var(--bg);display:flex;flex-direction:column;min-height:0;overflow:hidden}
.right-top{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;border-bottom:1px solid var(--br)}
.right-log{height:130px;display:flex;flex-direction:column;flex-shrink:0}
.priority-list{flex:1;overflow-y:auto;padding:6px}
.prow{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--muted);padding:8px 10px;margin-bottom:3px;cursor:pointer;transition:border-left-color .1s}
.prow:hover{border-left-color:var(--gold)}
.prow.p-critical{border-left-color:var(--red)}
.prow.p-high{border-left-color:var(--gold)}
.prow.p-med{border-left-color:var(--green)}
.priority-card-top{display:flex;align-items:center;gap:6px;margin-bottom:3px}
.priority-card-name{font-size:11px;font-weight:bold;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.priority-card-org{font-size:8px;color:var(--muted2);margin-bottom:2px}
.priority-card-nba{font-size:9px;color:var(--blue)}
.priority-card-badges{display:flex;gap:3px;flex-wrap:wrap}

/* Log */
.log-list{flex:1;overflow-y:auto;padding:4px 8px;background:var(--bg)}
.log-entry{display:flex;gap:8px;padding:3px 0;border-bottom:1px solid var(--br);font-size:8px}
.log-time{color:var(--muted);white-space:nowrap;min-width:100px}
.log-actor{color:var(--gold);min-width:55px}
.log-action{color:var(--text)}

/* ── BUTTONS ── */
.btn{background:none;border:1px solid var(--br2);color:var(--text);padding:5px 11px;cursor:pointer;font-family:inherit;font-size:8px;letter-spacing:1px;text-transform:uppercase;transition:all .1s}
.btn:hover{border-color:var(--gold);color:var(--gold)}
.btn.primary{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.btn.primary:hover{background:var(--gold);color:#000}
.btn.success{border-color:var(--green);color:var(--green);background:var(--grF)}
.btn.success:hover{background:var(--green);color:#000}
.btn.danger{border-color:var(--red);color:var(--red)}
.btn.danger:hover{background:var(--red);color:#fff}
.btn.sm{padding:3px 8px;font-size:7px}
.btn.xs{padding:2px 6px;font-size:7px;letter-spacing:0;text-transform:none}
.btn.link{border:none;color:var(--muted);font-size:7px;padding:2px 4px}
.btn.link:hover{color:var(--gold);border:none}
.brief-btn{border:1px solid var(--gold);color:var(--gold);background:var(--gf)}
.btn-start-pipeline{background:var(--green);border:none;color:#000;padding:4px 10px;font-size:7px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;cursor:pointer;font-family:inherit}
.btn-start-pipeline.locked{background:var(--s2);border:1px solid var(--br2);color:var(--muted);cursor:not-allowed}

/* ── TAGS ── */
.tag{display:inline-block;padding:1px 5px;font-size:7px;letter-spacing:1px;text-transform:uppercase;border:1px solid}
.tag.amber,.tag.warn{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.tag.green{background:var(--grF);border-color:var(--green);color:var(--green)}
.tag.red{background:var(--rf);border-color:var(--red);color:var(--red)}
.tag.blue{background:var(--bF);border-color:var(--blue);color:var(--blue)}
.tag.gray{background:var(--s2);border-color:var(--br2);color:var(--muted2)}
.tag.purple{background:var(--pF);border-color:var(--purple);color:var(--purple)}
.score-badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:18px;font-size:8px;font-weight:bold;border:1px solid}
.score-hot{background:var(--rf);border-color:var(--red);color:var(--red)}
.score-warm{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.score-cool{background:var(--grF);border-color:var(--green);color:var(--green)}
.score-cold{background:var(--s2);border-color:var(--br2);color:var(--muted2)}
.priority-badge{padding:1px 5px;border:1px solid;font-size:7px;letter-spacing:1px;text-transform:uppercase}
.priority-critical{background:var(--rf);border-color:var(--red);color:var(--red)}
.priority-high{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.priority-med{background:var(--grF);border-color:var(--green);color:var(--green)}
.priority-low{background:var(--s2);border-color:var(--br2);color:var(--muted2)}
.hold-badge{background:var(--pF);border:1px solid var(--purple);color:var(--purple);padding:1px 5px;font-size:7px;letter-spacing:1px}
.decay-indicator{font-size:7px}
.decay-hot{color:var(--red)}
.decay-warn{color:var(--gold)}
.decay-ok{color:var(--green)}

/* ── FORMS / MODALS ── */
.form-group{margin-bottom:10px}
label{display:block;font-size:7px;letter-spacing:1px;text-transform:uppercase;color:var(--muted2);margin-bottom:3px}
input,textarea,select{width:100%;background:var(--s2);border:1px solid var(--br2);color:var(--text);padding:6px 8px;font-family:inherit;font-size:11px}
input:focus,textarea:focus,select:focus{outline:1px solid var(--gold)}
textarea{resize:vertical;min-height:55px}
select{cursor:pointer}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;align-items:center;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:var(--s1);border:2px solid var(--gold);width:520px;max-width:95vw;max-height:85vh;overflow-y:auto;box-shadow:0 0 40px rgba(232,184,75,.15)}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid var(--br)}
.modal-title{color:var(--gold);letter-spacing:2px;text-transform:uppercase;font-size:9px}
.modal-close{background:none;border:none;color:var(--muted2);cursor:pointer;font-size:16px}
.modal-body{padding:14px}
.modal-footer{padding:10px 14px;border-top:1px solid var(--br);display:flex;gap:5px;justify-content:flex-end}

/* Section components used by mountIntelSections */
.stats-row{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.stat-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:10px 12px;flex:1;min-width:80px}
.stat-card.danger{border-top-color:var(--red)}
.stat-card.success{border-top-color:var(--green)}
.stat-value{font-size:18px;color:var(--gold);font-weight:bold}
.stat-card.danger .stat-value{color:var(--red)}
.stat-card.success .stat-value{color:var(--green)}
.stat-label{font-size:7px;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-top:2px}
.stat-sub{font-size:7px;color:var(--muted);margin-top:1px}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:5px}
.section-title{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}
.section-actions{display:flex;gap:4px;flex-wrap:wrap}
.info-panel{background:var(--bF);border:1px solid var(--blue);border-left:4px solid var(--blue);padding:8px 11px;color:#9ec5ff;font-size:9px;margin-bottom:10px}
.info-panel strong{color:#fff}
.alert-strip{background:var(--gf);border:1px solid var(--gold);border-left:4px solid var(--gold);padding:8px 11px;margin-bottom:6px;font-size:9px;color:var(--gold);display:flex;justify-content:space-between;align-items:center}
.alert-strip.danger{background:var(--rf);border-color:var(--red);color:var(--red)}
.obj-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:9px 11px;margin-bottom:6px}
.obj-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px}
.obj-type{font-size:9px;color:var(--gold);letter-spacing:1px}
.obj-vertical{font-size:7px;color:var(--muted2)}
.obj-counter{font-size:8px;color:#aaa;margin-bottom:4px;line-height:1.5}
.sequence-card{background:var(--s1);border:1px solid var(--br);padding:10px;margin-bottom:6px}
.sequence-header{display:flex;justify-content:space-between;margin-bottom:7px;flex-wrap:wrap;gap:4px}
.sequence-title{font-size:10px;margin-bottom:1px;font-weight:bold}
.sequence-meta{font-size:8px;color:var(--muted2)}
.sequence-steps{display:flex;margin-bottom:7px}
.step{flex:1;padding:4px 3px;border:1px solid var(--br);font-size:7px;text-align:center;color:var(--muted2);background:var(--s2)}
.step.done{border-color:var(--green);color:var(--green);background:var(--grF)}
.step.active{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.sequence-actions{display:flex;gap:3px;flex-wrap:wrap}
.queue-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:10px;margin-bottom:6px}
.queue-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px}
.queue-card-title{font-size:10px;margin-bottom:1px;font-weight:bold}
.queue-card-meta{font-size:8px;color:var(--muted2)}
.queue-card-body{font-size:9px;color:#999;margin-bottom:6px;line-height:1.5}
.queue-card-actions{display:flex;gap:3px;flex-wrap:wrap}
.meeting-card{background:var(--s1);border:1px solid var(--br);padding:10px;margin-bottom:6px}
.meeting-header{display:flex;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:4px}
.forecast-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px}
.forecast-card{background:var(--s1);border:1px solid var(--br);padding:12px;text-align:center}
.forecast-card.conservative{border-top:2px solid var(--muted)}
.forecast-card.base{border-top:2px solid var(--gold)}
.forecast-card.upside{border-top:2px solid var(--green)}
.forecast-val{font-size:18px;font-weight:bold;color:var(--gold)}
.forecast-card.conservative .forecast-val{color:var(--muted2)}
.forecast-card.upside .forecast-val{color:var(--green)}
.forecast-label{font-size:7px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.forecast-desc{font-size:8px;color:var(--muted2);margin-top:4px}
.pipeline-row{display:flex;gap:6px;margin-bottom:6px}
.pipeline-stage-label{font-size:7px;color:var(--muted2);width:90px;flex-shrink:0;padding-top:3px;letter-spacing:1px}
.pipeline-bar-wrap{flex:1;background:var(--s2);height:20px;position:relative;border:1px solid var(--br)}
.pipeline-bar-fill{height:100%;background:var(--gold);opacity:.6;transition:width .4s}
.pipeline-bar-label{position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:7px;color:var(--text)}
.pipeline-ev{width:60px;text-align:right;font-size:8px;color:var(--gold);padding-top:2px}
.dossier{background:var(--s2);border:1px solid var(--br);padding:11px;font-size:10px;line-height:1.8}
.dossier h4{color:var(--gold);letter-spacing:1px;text-transform:uppercase;font-size:8px;margin:10px 0 2px;border-bottom:1px solid var(--br);padding-bottom:2px}
.dossier p{color:#aaa}
.score-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:7px}
.score-row{background:var(--s2);border:1px solid var(--br);padding:4px 8px}
.score-row-label{font-size:7px;color:var(--muted2);letter-spacing:1px}
.score-row-val{font-size:11px;color:var(--gold);font-weight:bold;margin-top:1px}
.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px;margin-bottom:12px}
.agent-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:9px 11px;display:flex;flex-direction:column;gap:4px}
.agent-card h4{font-size:9px;color:var(--gold);letter-spacing:1px;text-transform:uppercase}
.agent-card p{font-size:8px;color:var(--muted2);line-height:1.4}
.agent-card .agent-meta{display:flex;justify-content:space-between;font-size:7px;color:var(--muted2)}
.agent-conflict{background:var(--rf);border:1px solid var(--red);color:var(--red);padding:1px 4px;font-size:7px;letter-spacing:1px}
.conflict-list{display:flex;flex-direction:column;gap:5px}
.conflict-item{background:var(--s1);border:1px solid var(--br);padding:7px 9px}
.conflict-item h5{font-size:8px;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
.conflict-item p{font-size:8px;color:#aaa;margin-bottom:2px}
.conflict-status{font-size:7px;letter-spacing:1px;text-transform:uppercase}
.conflict-status.pending{color:var(--gold)}
.conflict-status.resolved{color:var(--green)}
.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.sim-card{background:var(--s1);border:1px solid var(--br);padding:11px}
.sim-card h4{font-size:8px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:6px}
.sim-inputs{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sim-output{margin-top:9px;background:var(--s2);border:1px solid var(--br);padding:9px;font-size:9px;line-height:1.6;color:#cfd6ff;min-height:70px;white-space:pre-wrap}
.constraints-panel{background:var(--s1);border:1px solid var(--br);padding:12px;margin-bottom:9px}
.constraints-panel h4{font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
.constraints-panel ol{padding-left:13px;font-size:9px;line-height:1.6;color:#ccc}
.constraints-panel li{margin-bottom:2px}
.constraints-subgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:7px}
.constraints-subgrid div{background:var(--s2);border:1px solid var(--br);padding:7px;font-size:8px;line-height:1.5}
.constraints-subgrid strong{color:var(--gold);display:block;margin-bottom:2px;letter-spacing:1px}
.disc-log{background:var(--bg);border:1px solid var(--br);padding:7px;font-size:8px;max-height:130px;overflow-y:auto;margin-top:9px;color:var(--muted2)}
.discovery-toggle{display:flex;gap:4px;align-items:center;margin-bottom:11px;flex-wrap:wrap}
.disc-mode-btn{border:1px solid var(--br2);background:transparent;color:var(--muted2);padding:3px 9px;font-size:7px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit}
.disc-mode-btn.active-OFF{border-color:var(--muted2);color:var(--muted2)}
.disc-mode-btn.active-SEARCHING{border-color:var(--green);color:var(--green);background:var(--grF)}
.disc-mode-btn.active-PAUSED{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.chart-card{background:var(--s1);border:1px solid var(--br);padding:12px}
.chart-card-title{font-size:7px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-bottom:9px}
.chart-card.full{grid-column:span 2}

/* Pipeline (table view) hidden but accessible */
.pipe-table-view{display:none;max-height:200px;overflow-y:auto}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:5px 9px;font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2);border-bottom:1px solid var(--br)}
td{padding:6px 9px;border-bottom:1px solid var(--br);font-size:9px;vertical-align:middle}
tr:hover td{background:var(--s2)}

/* Constraint reminder */
.constraint-reminder-item{font-size:7px;padding:1px 0;color:var(--muted2)}

#toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:var(--s1);border:1px solid var(--gold);color:var(--gold);padding:8px 18px;font-size:9px;letter-spacing:1px;z-index:9999;display:none;box-shadow:0 0 20px rgba(232,184,75,.2)}

/* Intel details modal */
.intel-detail-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:5000;align-items:center;justify-content:center}
.intel-detail-modal.open{display:flex}
.idm-box{background:var(--s1);border:2px solid var(--gold);width:600px;max-width:95vw;max-height:80vh;overflow-y:auto;padding:0}

::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--br2)}
::-webkit-scrollbar-thumb:hover{background:var(--muted)}
</style>
</head>
<body class="hud-bg">

<!-- AUTH GATE -->
<div id="auth-gate">
  <div class="auth-box">
    <div class="auth-logo">TRESTLEBOARD</div>
    <div class="auth-tagline">Revenue Operations Command</div>
    <div class="auth-div"></div>
    <form onsubmit="checkAuth(event)">
      <input type="password" id="auth-input" placeholder="ACCESS CODE" autocomplete="off">
      <button type="submit" class="auth-btn">AUTHENTICATE</button>
    </form>
    <div class="auth-error" id="auth-error"></div>
  </div>
</div>

<!-- BUILD BAR -->
<div id="build-bar">
  <div style="display:flex;gap:12px;align-items:center">
    <span><span class="live-dot"></span>LIVE</span>
    <span>TRESTLEBOARD OPS</span>
    <span>LAST UPDATED: <strong id="build-ts" style="color:var(--gold)">--</strong></span>
  </div>
  <span id="current-time"></span>
</div>

<!-- HEADER -->
<div class="header">
  <div>
    <div class="logo">TRESTLEBOARD</div>
    <div class="logo-sub">REVENUE OPERATIONS SYSTEM</div>
  </div>
  <div class="mode-strip">
    <span style="font-size:7px;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-right:2px">MODE</span>
    <div id="mode-selector" style="display:flex;gap:3px">
      <button class="mode-btn manual" data-mode="MANUAL" onclick="setAutonomyMode('MANUAL')">MANUAL</button>
      <button class="mode-btn semi" data-mode="SEMI-AUTO" onclick="setAutonomyMode('SEMI-AUTO')">SEMI</button>
      <button class="mode-btn full" data-mode="FULL AUTO" onclick="setAutonomyMode('FULL AUTO')">FULL</button>
    </div>
    <button class="btn sm brief-btn" onclick="openStrategicBrief()">BRIEF</button>
    <button class="btn sm" onclick="_openSettings()">SETTINGS</button>
  </div>
</div>

<!-- RESOURCE BAR (4 stats) -->
<div class="resource-bar">
  <div class="resource ev">
    <div>
      <div class="res-num" id="tm-pipeline">$0</div>
      <div class="res-label">Pipeline Value</div>
      <div class="res-sub">expected revenue</div>
    </div>
  </div>
  <div class="resource active">
    <div>
      <div class="res-num" id="cmd-active">0</div>
      <div class="res-label">Active Leads</div>
      <div class="res-sub" id="cmd-total-sub">in pipeline</div>
    </div>
  </div>
  <div class="resource risk">
    <div>
      <div class="res-num" id="cmd-decay">0</div>
      <div class="res-label">Need Attention</div>
      <div class="res-sub">cold or stale</div>
    </div>
  </div>
  <div class="resource intel">
    <div>
      <div class="res-num" id="cmd-intel-count">0</div>
      <div class="res-label">Intel Queue</div>
      <div class="res-sub">contacts to review</div>
    </div>
  </div>
</div>

<!-- HUD BODY -->
<div class="hud-body">

  <!-- CONVEYOR BELT PIPELINE -->
  <div class="conveyor-section">
    <div class="conveyor-label">
      PIPELINE CONVEYOR
      <span class="conveyor-arrow">&#9658;&#9658;&#9658;</span>
      <span style="font-size:7px;color:var(--muted2)">PROSPECT</span>
      <span class="conveyor-arrow">&#8594;</span>
      <span style="font-size:7px;color:var(--muted2)">QUALIFIED</span>
      <span class="conveyor-arrow">&#8594;</span>
      <span style="font-size:7px;color:var(--muted2)">PROPOSAL</span>
      <span class="conveyor-arrow">&#8594;</span>
      <span style="font-size:7px;color:var(--muted2)">NEGOTIATION</span>
      <span class="conveyor-arrow">&#8594;</span>
      <span style="font-size:7px;color:var(--gold)">CLOSED</span>
      <button class="btn xs" style="margin-left:8px" onclick="openAddLead()">+ ADD UNIT</button>
      <button class="btn xs" onclick="exportLeads()">EXPORT</button>
      <button class="btn xs" onclick="_toggleTable()">LIST VIEW</button>
    </div>
    <div id="kanban-board" class="kanban"></div>
    <div id="pview-table" class="pipe-table-view">
      <table><thead><tr>
        <th>Score</th><th>Name</th><th>Org</th><th>Vertical</th>
        <th>Stage</th><th>Decay</th><th>Priority</th><th>Next Action</th>
        <th>Profile</th><th>Value</th><th>Contact</th><th>Actions</th>
      </tr></thead><tbody id="lead-tbody"></tbody></table>
    </div>
    <!-- hidden pipeline compat IDs -->
    <div style="display:none">
      <div id="pview-kanban"></div>
      <div class="pipeline-sub-nav"><button class="sub-pill active"></button></div>
    </div>
  </div>

  <!-- BOTTOM PANELS -->
  <div class="bottom-panels">

    <!-- LEFT: INTEL QUEUE -->
    <div class="intel-panel">
      <div class="panel-header">
        <div class="panel-title">
          <span id="intel-queue-dot" style="width:6px;height:6px;border-radius:50%;background:var(--gold);display:inline-block;animation:pulse 1.5s infinite"></span>
          INTEL QUEUE
          <span class="panel-count" id="cmd-intel-count2">0</span>
        </div>
        <div class="panel-actions">
          <button class="btn xs" onclick="_reloadAllLeads()">RELOAD</button>
        </div>
      </div>
      <div class="intel-queue" id="intel-queue-list">
        <div style="padding:20px;text-align:center;color:var(--muted2)">
          <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">LOADING INTEL...</div>
          <div style="font-size:8px;color:var(--muted)">Contacts will appear here</div>
        </div>
      </div>
    </div>

    <!-- RIGHT: PRIORITY TARGETS + LOG -->
    <div class="right-panel">
      <div class="right-top">
        <div class="panel-header">
          <div class="panel-title">PRIORITY TARGETS</div>
          <div style="font-size:7px;color:var(--muted2)" id="mode-display">SEMI-AUTO</div>
        </div>
        <div class="priority-list" id="cmd-hot-leads">
          <div style="padding:16px;text-align:center;color:var(--muted2)">
            <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">NO ACTIVE LEADS</div>
            <div style="font-size:8px">Add leads from Intel Queue to get started</div>
          </div>
        </div>
      </div>
      <div class="right-log">
        <div class="panel-header" style="border-top:1px solid var(--br)">
          <div class="panel-title">ACTIVITY LOG</div>
          <button class="btn xs" onclick="clearLog()">CLEAR</button>
        </div>
        <div class="log-list" id="audit-log-list"></div>
      </div>
    </div>

  </div>
</div>

<!-- ═══════════ SETTINGS PANEL (slide-in) ═══════════ -->
<div id="settings-panel" style="display:none;position:fixed;right:0;top:0;bottom:0;width:420px;background:var(--s1);border-left:2px solid var(--gold);z-index:4000;overflow-y:auto;padding:0">
  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--br);background:var(--s2)">
    <span style="font-size:9px;color:var(--gold);letter-spacing:3px;text-transform:uppercase">SYSTEM SETTINGS</span>
    <button class="btn xs danger" onclick="_closeSettings()">CLOSE</button>
  </div>
  <div style="padding:16px">
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">ANALYTICS</div>
    <div id="section-analytics-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">REVENUE FORECAST</div>
    <div id="section-forecast-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">SIMULATION</div>
    <div id="section-simulation-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">CAMPAIGNS</div>
    <div id="section-outreach-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">CONTENT QUEUE</div>
    <div id="section-content-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">OBJECTIONS</div>
    <div id="section-objections-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">MEETINGS</div>
    <div id="section-meetings-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">AGENTS</div>
    <div id="section-agents-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">RULES</div>
    <div id="section-constraints-inner" style="margin-bottom:16px"></div>
    <div style="font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--br);padding-bottom:4px">AUDIT LOG</div>
    <div id="section-auditlog-inner"></div>
  </div>
</div>

<!-- HIDDEN COMPAT IDs -->
<div style="display:none">
  <span id="cmd-stale"></span><span id="cmd-briefings"></span><span id="cmd-closed"></span>
  <span id="tm-leads"></span><span id="tm-decay"></span><span id="cmd-total"></span>
  <span id="cmd-contact-approved"></span><span id="cmd-contact-locked"></span>
  <span id="nav-conflict-badge"></span><span id="nav-discovery-indicator"></span>
  <span id="nav-intel-badge"></span>
  <div id="hold-info"></div><div id="alert-container"></div>
  <div id="cmd-forecast-mini"></div><div id="cmd-objections-mini"></div>
  <div id="constraints-banner"></div><div id="constraint-reminder"></div>
  <div id="intel-banner"><span id="intel-banner-msg"></span></div>
  <!-- Discovery legacy sub-system -->
  <div id="section-discovery-inner">
    <div class="discovery-toggle">
      <button id="disc-btn-OFF" class="disc-mode-btn active-OFF" onclick="setDiscoveryMode('OFF')">OFF</button>
      <button id="disc-btn-SEARCHING" class="disc-mode-btn" onclick="setDiscoveryMode('SEARCHING')">SEARCHING</button>
      <button id="disc-btn-PAUSED" class="disc-mode-btn" onclick="setDiscoveryMode('PAUSED')">PAUSED</button>
      <input id="disc-webhook-input" placeholder="Webhook URL">
    </div>
    <table><tbody id="discovery-queue-tbody"></tbody></table>
    <ul id="disc-log-list"></ul>
  </div>
  <!-- nav shims for showPage/pipeline compat -->
  <div class="main-nav">
    <button class="nav-pill active" id="_nav-command"></button>
    <button class="nav-pill" id="_nav-pipeline"></button>
    <button class="nav-pill" id="_nav-intel"></button>
  </div>
  <div class="page active" id="page-command"></div>
  <div class="page" id="page-pipeline"></div>
  <div class="page" id="page-intel"></div>
</div>

<!-- ═══════════ MODALS ═══════════ -->
<div class="modal-overlay" id="modal-lead">
  <div class="modal">
    <div class="modal-header"><span class="modal-title" id="lead-modal-title">Lead</span><button class="modal-close" onclick="closeModal('modal-lead')">&#215;</button></div>
    <div class="modal-body">
      <input type="hidden" id="lead-id">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
        <div class="form-group"><label>Name</label><input id="lead-name" placeholder="Full name"></div>
        <div class="form-group"><label>Organization</label><input id="lead-org" placeholder="Company"></div>
        <div class="form-group"><label>Email</label><input id="lead-email" placeholder="email@org.com"></div>
        <div class="form-group"><label>Value ($)</label><input id="lead-value" type="number" placeholder="50000"></div>
        <div class="form-group"><label>Stage</label><select id="lead-status"><option>Prospect</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Closed</option><option>Archived</option></select></div>
        <div class="form-group"><label>Vertical</label><select id="lead-vertical"><option>Defense Contractor</option><option>Government</option><option>Healthcare</option><option>Finance</option><option>Tech</option><option>Other</option></select></div>
        <div class="form-group"><label>Psych Profile</label><select id="lead-psych"><option>Analytical</option><option>Driver</option><option>Expressive</option><option>Amiable</option></select></div>
        <div class="form-group"><label>Urgency (1-10)</label><input id="lead-urgency" type="number" min="1" max="10" value="5"></div>
        <div class="form-group"><label>Days in Stage</label><input id="lead-days" type="number" value="0"></div>
        <div class="form-group"><label>Manual Hold</label><select id="lead-hold"><option value="false">No</option><option value="true">Yes</option></select></div>
        <div class="form-group"><label>Contact Approved</label><select id="lead-contact-approved"><option value="false">No</option><option value="true">Yes</option></select></div>
      </div>
      <div class="form-group"><label>Notes / Intel</label><textarea id="lead-notes" rows="3"></textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">
        <div class="form-group"><label>Engagement (0-10)</label><input id="score-engagement" type="number" min="0" max="10" value="5"></div>
        <div class="form-group"><label>Response Speed (0-10)</label><input id="score-speed" type="number" min="0" max="10" value="5"></div>
        <div class="form-group"><label>Strategic Fit (0-10)</label><input id="score-fit" type="number" min="0" max="10" value="5"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">
        <div class="form-group"><label>NBA Primary</label><input id="nba-primary" placeholder="Next action"></div>
        <div class="form-group"><label>NBA Fallback</label><input id="nba-fallback" placeholder="Fallback"></div>
        <div class="form-group"><label>NBA Escalation</label><input id="nba-escalation" placeholder="Escalation"></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn danger sm" onclick="closeModal('modal-lead')">CANCEL</button><button class="btn primary sm" onclick="saveLead()">SAVE</button></div>
  </div>
</div>
<div class="modal-overlay" id="modal-dossier"><div class="modal"><div class="modal-header"><span class="modal-title">Dossier</span><button class="modal-close" onclick="closeModal('modal-dossier')">&#215;</button></div><div class="modal-body" id="dossier-body"></div><div class="modal-footer"><button class="btn sm" onclick="closeModal('modal-dossier')">CLOSE</button></div></div></div>
<div class="modal-overlay" id="modal-strategic"><div class="modal" style="width:660px"><div class="modal-header"><span class="modal-title">Strategic Brief</span><button class="modal-close" onclick="closeModal('modal-strategic')">&#215;</button></div><div class="modal-body" id="strategic-brief-body"></div><div class="modal-footer"><button class="btn sm" onclick="closeModal('modal-strategic')">CLOSE</button></div></div></div>
<div class="modal-overlay" id="modal-contact-approve"><div class="modal"><div class="modal-header"><span class="modal-title">Approve Contact</span><button class="modal-close" onclick="closeModal('modal-contact-approve')">&#215;</button></div><div class="modal-body" id="contact-approve-text"></div><div class="modal-footer"><button class="btn danger sm" onclick="closeModal('modal-contact-approve')">CANCEL</button><button class="btn success sm" id="contact-approve-confirm">APPROVE</button></div></div></div>
<div class="modal-overlay" id="modal-objection"><div class="modal"><div class="modal-header"><span class="modal-title">Objection</span><button class="modal-close" onclick="closeModal('modal-objection')">&#215;</button></div><div class="modal-body"><input type="hidden" id="obj-id"><div class="form-group"><label>Outcome</label><select id="obj-outcome"><option>Unresolved</option><option>Resolved</option><option>Escalated</option></select></div><div class="form-group"><label>Type</label><input id="obj-type"></div><div class="form-group"><label>Vertical</label><input id="obj-vertical"></div><div class="form-group"><label>Objection</label><textarea id="obj-text" rows="2"></textarea></div><div class="form-group"><label>Counter</label><textarea id="obj-counter" rows="2"></textarea></div></div><div class="modal-footer"><button class="btn sm" onclick="closeModal('modal-objection')">CANCEL</button><button class="btn primary sm" onclick="saveObjection()">SAVE</button></div></div></div>
<div class="modal-overlay" id="modal-conflict"><div class="modal"><div class="modal-header"><span class="modal-title">Conflict</span><button class="modal-close" onclick="closeModal('modal-conflict')">&#215;</button></div><div class="modal-body"><input type="hidden" id="conflict-id"><div class="form-group"><label>Deal</label><input id="conflict-deal"></div><div class="form-group"><label>Agent A</label><input id="conflict-agent-a"></div><div class="form-group"><label>Agent B</label><input id="conflict-agent-b"></div><div class="form-group"><label>Options</label><textarea id="conflict-options" rows="2"></textarea></div><div class="form-group"><label>Status</label><select id="conflict-status"><option>pending</option><option>resolved</option></select></div><div class="form-group"><label>Resolution</label><textarea id="conflict-resolution" rows="2"></textarea></div></div><div class="modal-footer"><button class="btn sm" onclick="closeModal('modal-conflict')">CANCEL</button><button class="btn primary sm" onclick="saveConflict()">SAVE</button></div></div></div>
<div class="modal-overlay" id="modal-campaign"><div class="modal"><div class="modal-header"><span class="modal-title">Campaign</span><button class="modal-close" onclick="closeModal('modal-campaign')">&#215;</button></div><div class="modal-body"><div class="form-group"><label>Name</label><input id="camp-name"></div><div class="form-group"><label>Vertical</label><input id="camp-vertical"></div><div class="form-group"><label>Type</label><input id="camp-type"></div><div class="form-group"><label>Brief</label><textarea id="camp-brief" rows="3"></textarea></div></div><div class="modal-footer"><button class="btn sm" onclick="closeModal('modal-campaign')">CANCEL</button><button class="btn primary sm" onclick="saveCampaign()">SAVE</button></div></div></div>
<div class="modal-overlay" id="modal-brief"><div class="modal"><div class="modal-header"><span class="modal-title">Brief</span><button class="modal-close" onclick="closeModal('modal-brief')">&#215;</button></div><div class="modal-body"><div class="form-group"><label>Title</label><input id="brief-title"></div><div class="form-group"><label>Body</label><textarea id="brief-body" rows="4"></textarea></div><div class="form-group"><label>Type</label><input id="brief-type"></div><div class="form-group"><label>Priority</label><select id="brief-priority"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div></div><div class="modal-footer"><button class="btn sm" onclick="closeModal('modal-brief')">CANCEL</button><button class="btn primary sm" onclick="saveBrief()">SAVE</button></div></div></div>
<div class="modal-overlay" id="modal-meeting"><div class="modal"><div class="modal-header"><span class="modal-title">Meeting</span><button class="modal-close" onclick="closeModal('modal-meeting')">&#215;</button></div><div class="modal-body"><div class="form-group"><label>Lead</label><input id="meeting-lead"></div><div class="form-group"><label>Date / Time</label><input id="meeting-datetime" type="datetime-local"></div><div class="form-group"><label>Format</label><select id="meeting-format"><option>Virtual</option><option>In-Person</option><option>Phone</option></select></div><div class="form-group"><label>Notes</label><textarea id="meeting-notes" rows="3"></textarea></div></div><div class="modal-footer"><button class="btn sm" onclick="closeModal('modal-meeting')">CANCEL</button><button class="btn primary sm" onclick="saveMeeting()">SAVE</button></div></div></div>

<div id="toast"></div>

<script src="data.js"><\/script>
<script>
${js}

// ══ POST-JS ADDITIONS ════════════════════════════════════

// Build timestamp
(function() {
  var el = document.getElementById('build-ts');
  if (el) {
    try { var d = new Date('${BT}'); el.textContent = d.toLocaleString('en-US',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}) + ' ET'; }
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
    var lines = (item.intel || '').split('\\n');
    var emailLine = lines.find(function(l) { return l.toLowerCase().indexOf('email') > -1; }) || '';
    var emailMatch = emailLine.match(/:\\s*([^\\s(]+@[^\\s]+)/);
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
<\/script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Built:', html.split('\n').length, 'lines,', Math.round(html.length/1024) + 'KB');
