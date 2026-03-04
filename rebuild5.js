// rebuild5.js — Final working build
// Uses CLEAN JS from commit 4351c39 (no pollution, syntax-verified)
// HTML uses EXACT class names the original JS expects
const fs   = require('fs');
const js   = fs.readFileSync('_orig_js.js', 'utf8');
const BT   = new Date().toISOString();

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
  --bg:#07080d;--s1:#0e1016;--s2:#14171f;--s3:#1a1d28;
  --br:#1e2232;--br2:#272d42;
  --gold:#e8b84b;--gold2:#f5d070;--gf:#e8b84b16;
  --red:#e03e3e;--rf:#e03e3e16;
  --green:#2ec76e;--grF:#2ec76e16;
  --blue:#4d8ef0;--bF:#4d8ef016;
  --purple:#9d60f8;--pF:#9d60f816;
  --text:#dde0f0;--dim:#505570;--dim2:#727898;
  --r:2px;
}
body{background:var(--bg);color:var(--text);font-family:'Courier New',monospace;min-height:100vh;font-size:13px}

/* ── AUTH ── */
#auth-gate{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:9999}
#auth-gate.hidden{display:none!important}
.auth-box{background:var(--s1);border:2px solid var(--gold);padding:48px 56px;width:380px;text-align:center}
.auth-logo{font-size:22px;letter-spacing:6px;color:var(--gold);font-weight:bold;margin-bottom:4px}
.auth-tagline{font-size:9px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;margin-bottom:28px}
.auth-div{display:none}
.auth-box input[type="password"]{width:100%;background:var(--s2);border:2px solid var(--br2);color:var(--text);padding:14px;font-family:inherit;font-size:18px;text-align:center;letter-spacing:6px;margin-bottom:10px}
.auth-box input:focus{outline:none;border-color:var(--gold)}
.auth-btn{width:100%;background:var(--gold);border:none;color:#000;padding:14px;font-family:inherit;font-size:11px;letter-spacing:4px;text-transform:uppercase;cursor:pointer;font-weight:bold}
.auth-btn:hover{background:var(--gold2)}
.auth-error{color:var(--red);font-size:10px;margin-top:10px;min-height:16px;letter-spacing:1px}

/* ── BUILD BAR ── */
#build-bar{background:#000;border-bottom:1px solid var(--br);padding:5px 18px;display:flex;align-items:center;justify-content:space-between;font-size:9px;color:var(--dim);letter-spacing:1px;position:sticky;top:0;z-index:200}
.live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);margin-right:5px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
#current-time{font-size:9px;color:var(--dim)}

/* ── TOPBAR ── */
.topbar{background:var(--s1);border-bottom:2px solid var(--br);padding:12px 18px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:22px;z-index:100}
.logo-main{font-size:16px;font-weight:bold;color:var(--gold);letter-spacing:5px}
.logo-sub{font-size:7px;color:var(--dim);letter-spacing:2px;margin-top:2px}
.top-controls{display:flex;align-items:center;gap:6px}
/* mode-btn — exact class name used by updateModeSelectorUI() */
.mode-btn{background:transparent;border:1px solid var(--br2);color:var(--dim);padding:5px 12px;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit;transition:all .15s}
.mode-btn.manual.active,.mode-btn.active{border-color:var(--blue);color:var(--blue);background:var(--bF)}
.mode-btn.semi.active{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.mode-btn.full.active{border-color:var(--green);color:var(--green);background:var(--grF)}
.brief-btn{border:1px solid var(--gold);color:var(--gold);background:var(--gf);padding:5px 12px;font-size:9px;letter-spacing:1px;cursor:pointer;font-family:inherit;text-transform:uppercase}

/* ── MAIN-NAV — .main-nav .nav-pill.active (exact JS expectation) ── */
.main-nav{display:flex;background:var(--s1);border-bottom:2px solid var(--br)}
.nav-pill{flex:1;background:transparent;border:none;border-bottom:3px solid transparent;padding:14px 8px;font-family:inherit;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--dim);cursor:pointer;transition:all .15s}
.nav-pill:hover{color:var(--text)}
.nav-pill.active{color:var(--gold);border-bottom-color:var(--gold);background:var(--gf)}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:var(--red);color:#fff;font-size:8px;font-weight:bold;animation:pulse 1.5s infinite}
.intel-alert-badge{background:var(--gold);color:#000}

/* ── PAGES — .page.active shown ── */
.page{display:none}
.page.active{display:block}

/* ── INTEL BANNER ── */
.intel-banner{display:none;background:var(--gf);border-bottom:2px solid var(--gold);padding:12px 18px;cursor:pointer;align-items:center;justify-content:space-between}
.intel-banner.show{display:flex}
.intel-banner-inner{display:flex;align-items:center;gap:10px;width:100%}
.intel-banner-text h3{font-size:11px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:1px}
.intel-banner-text p{font-size:9px;color:var(--dim2)}
.intel-banner-arrow{margin-left:auto;color:var(--gold);font-size:14px;font-weight:bold}

/* ── 4 STAT TILES ── */
.mission-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--br)}
.stat-tile{background:var(--s1);padding:22px 14px;text-align:center;position:relative}
.stat-tile::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.stat-tile.ev::before{background:var(--gold)}
.stat-tile.active::before{background:var(--green)}
.stat-tile.risk::before{background:var(--red)}
.stat-tile.intel::before{background:var(--purple)}
.stat-tile-val{font-size:34px;font-weight:bold;line-height:1;margin-bottom:5px}
.stat-tile.ev .stat-tile-val{color:var(--gold)}
.stat-tile.active .stat-tile-val{color:var(--green)}
.stat-tile.risk .stat-tile-val{color:var(--red)}
.stat-tile.intel .stat-tile-val{color:var(--purple)}
.stat-tile-label{font-size:8px;color:var(--dim);letter-spacing:2px;text-transform:uppercase}
.stat-tile-sub{font-size:8px;color:var(--dim);margin-top:3px}

/* ── COMMAND SPLIT ── */
.cmd-body{display:grid;grid-template-columns:1fr 300px}
.cmd-left{padding:18px;border-right:1px solid var(--br)}
.cmd-right{padding:18px;background:var(--s1)}
.blk-label{font-size:8px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;padding-bottom:5px;border-bottom:1px solid var(--br)}

/* Priority cards */
.priority-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--br2);padding:12px 14px;margin-bottom:7px;cursor:pointer;transition:border-left-color .15s}
.priority-card:hover{border-left-color:var(--gold)}
.priority-card.p-critical{border-left-color:var(--red)}
.priority-card.p-high{border-left-color:var(--gold)}
.priority-card.p-med{border-left-color:var(--green)}
.priority-card-top{display:flex;align-items:center;gap:8px;margin-bottom:5px}
.priority-card-name{font-size:13px;font-weight:bold;flex:1}
.priority-card-org{font-size:10px;color:var(--dim2);margin-bottom:4px}
.priority-card-nba{font-size:10px;color:var(--blue)}
.priority-card-badges{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:5px}

/* Empty guide */
.guide-box{text-align:center;padding:40px 18px;color:var(--dim)}
.guide-title{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--dim2);margin-bottom:8px}
.guide-text{font-size:11px;line-height:1.7;margin-bottom:18px}

/* Chart boxes */
.cmd-chart-card{background:var(--s2);padding:12px;margin-bottom:10px}
.cmd-chart-label{font-size:8px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}

/* ── PIPELINE ── */
.pipeline-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--br);background:var(--s1)}
/* pipeline-sub-nav / sub-pill.active — exact JS expectation */
.pipeline-sub-nav{display:flex;gap:4px}
.sub-pill{background:transparent;border:1px solid var(--br2);color:var(--dim);padding:6px 14px;font-size:8px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:all .15s}
.sub-pill.active{background:var(--gf);border-color:var(--gold);color:var(--gold)}
/* pipeline-view.active — exact JS expectation */
.pipeline-view{display:none;padding:18px}
.pipeline-view.active{display:block}

/* Kanban */
.kanban{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px}
.kanban-col{min-width:155px;flex:1;background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--br2)}
.kanban-col-header{padding:9px 11px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between;align-items:center}
.kanban-col-title{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--dim)}
.kanban-col-count{font-size:8px;color:var(--dim)}
.kanban-col-body{padding:5px;min-height:70px}
.kanban-card{background:var(--s2);border-left:3px solid var(--br2);padding:9px;margin-bottom:5px;cursor:grab;transition:border-left-color .15s}
.kanban-card:hover{border-left-color:var(--gold)}
.kanban-card.dragging{opacity:.3}
.kanban-card.decay-hot{border-left-color:var(--red)}
.kanban-card.decay-warn{border-left-color:var(--gold)}
.kanban-card.decay-ok{border-left-color:var(--green)}
.kanban-col.drag-over{background:var(--gf);border-color:var(--gold)}
.card-name{font-size:12px;font-weight:bold;margin-bottom:2px}
.card-org{font-size:9px;color:var(--dim2);margin-bottom:4px}
.card-score-bar{height:2px;background:var(--br);margin-bottom:3px;overflow:hidden}
.card-score-fill{height:100%}
.card-score-label{font-size:8px;color:var(--dim);margin-bottom:3px}
.card-actions{display:flex;gap:3px;flex-wrap:wrap}

table{width:100%;border-collapse:collapse}
th{text-align:left;padding:7px 11px;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--br)}
td{padding:8px 11px;border-bottom:1px solid var(--br);font-size:11px;vertical-align:middle}
tr:hover td{background:var(--s2)}

/* FAB */
.fab{position:fixed;bottom:22px;right:22px;background:var(--gold);color:#000;border:none;width:50px;height:50px;border-radius:50%;font-size:24px;cursor:pointer;display:none;align-items:center;justify-content:center;font-weight:bold;z-index:300}
.fab.visible{display:flex}
.fab:hover{background:var(--gold2)}

/* ── INTEL ACCORDION — accordion-header.open, toggleIntelPanel() ── */
.accordion-header{display:flex;justify-content:space-between;align-items:center;background:var(--s1);padding:12px 16px;cursor:pointer;border-left:3px solid transparent;user-select:none;transition:all .15s}
.accordion-header:hover{background:var(--s2)}
.accordion-header.open{border-left-color:var(--gold);background:var(--s2)}
.accordion-title{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--dim)}
.accordion-header.open .accordion-title{color:var(--gold)}
.accordion-chevron{font-size:9px;color:var(--dim);transition:transform .2s}
.accordion-header.open .accordion-chevron{transform:rotate(180deg);color:var(--gold)}
.accordion-body{display:none;padding:18px;background:var(--s2);border-left:3px solid var(--gold)}

/* Discovery */
.intel-count-bar{background:var(--gf);border:1px solid var(--gold);padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
.intel-count-num{font-size:26px;font-weight:bold;color:var(--gold)}
.intel-count-label{font-size:9px;color:var(--dim2);letter-spacing:1px;margin-top:2px}

/* Contact discovery cards */
.ccard{background:var(--s1);border:1px solid var(--br);margin-bottom:6px;overflow:hidden;transition:border-color .15s}
.ccard:hover{border-color:var(--br2)}
.ccard-top{display:flex;align-items:center;gap:12px;padding:13px 14px;cursor:pointer}
.ccard-conf{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid;flex-shrink:0}
.conf-high{background:var(--grF);border-color:var(--green);color:var(--green)}
.conf-med{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.conf-low{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.ccard-info{flex:1;min-width:0}
.ccard-name{font-size:14px;font-weight:bold;margin-bottom:2px}
.ccard-role{font-size:9px;color:var(--dim2);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ccard-org{font-size:10px;color:var(--gold);margin-bottom:1px}
.ccard-loc{font-size:8px;color:var(--dim)}
.ccard-quick-btns{display:flex;flex-direction:column;gap:4px;align-items:flex-end;flex-shrink:0}
.ccard-body{display:none;padding:0 14px 14px;border-top:1px solid var(--br)}
.ccard-body.expanded{display:block}
.intel-txt{background:var(--s2);padding:11px 13px;font-size:10px;color:#b0b5cc;line-height:1.8;margin:10px 0;white-space:pre-wrap;border-left:2px solid var(--br2)}
.ccard-foot{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}

/* Pipeline start button */
.btn-start-pipeline{background:var(--green);border:none;color:#000;padding:7px 16px;font-size:9px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;cursor:pointer;font-family:inherit}
.btn-start-pipeline:hover{opacity:.85}
.btn-start-pipeline.locked{background:var(--s2);border:1px solid var(--br2);color:var(--dim);cursor:not-allowed}
.btn-start-pipeline.locked:hover{opacity:1}

/* Group label in discovery */
.vgroup-label{font-size:8px;color:var(--dim);letter-spacing:3px;text-transform:uppercase;padding:6px 0;border-bottom:1px solid var(--br);margin-bottom:6px;margin-top:14px}

/* ── BUTTONS ── */
.btn{background:none;border:1px solid var(--br2);color:var(--text);padding:6px 13px;cursor:pointer;font-family:inherit;font-size:9px;letter-spacing:1px;text-transform:uppercase;transition:all .15s}
.btn:hover{border-color:var(--gold);color:var(--gold)}
.btn.primary{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.btn.primary:hover{background:var(--gold);color:#000}
.btn.success{border-color:var(--green);color:var(--green);background:var(--grF)}
.btn.success:hover{background:var(--green);color:#000}
.btn.danger{border-color:var(--red);color:var(--red)}
.btn.danger:hover{background:var(--red);color:#fff}
.btn.warn{border-color:var(--gold);color:var(--gold)}
.btn.sm{padding:4px 9px;font-size:8px}
.btn.xs{padding:2px 7px;font-size:8px;letter-spacing:0;text-transform:none}
.btn.link{border:none;color:var(--dim);padding:2px 4px;font-size:8px}
.btn.link:hover{color:var(--gold);border:none}
.btn.brief-btn{border-color:var(--gold);color:var(--gold);background:var(--gf)}

/* Tags */
.tag{display:inline-block;padding:2px 6px;font-size:8px;letter-spacing:1px;text-transform:uppercase;border:1px solid}
.tag.amber,.tag.warn{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.tag.green{background:var(--grF);border-color:var(--green);color:var(--green)}
.tag.red{background:var(--rf);border-color:var(--red);color:var(--red)}
.tag.blue{background:var(--bF);border-color:var(--blue);color:var(--blue)}
.tag.gray{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.tag.purple{background:var(--pF);border-color:var(--purple);color:var(--purple)}
.score-badge{display:inline-flex;align-items:center;justify-content:center;width:32px;height:20px;font-size:9px;font-weight:bold;border:1px solid}
.score-hot{background:var(--rf);border-color:var(--red);color:var(--red)}
.score-warm{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.score-cool{background:var(--grF);border-color:var(--green);color:var(--green)}
.score-cold{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.priority-badge{padding:2px 6px;border:1px solid;font-size:8px;letter-spacing:1px;text-transform:uppercase}
.priority-critical{background:var(--rf);border-color:var(--red);color:var(--red)}
.priority-high{background:var(--gf);border-color:var(--gold);color:var(--gold)}
.priority-med{background:var(--grF);border-color:var(--green);color:var(--green)}
.priority-low{background:var(--s2);border-color:var(--br2);color:var(--dim)}
.hold-badge{background:var(--pF);border:1px solid var(--purple);color:var(--purple);padding:2px 6px;font-size:8px;letter-spacing:1px}
.decay-indicator{font-size:8px}
.decay-hot{color:var(--red)}
.decay-warn{color:var(--gold)}
.decay-ok{color:var(--green)}

/* Forms */
.form-group{margin-bottom:11px}
label{display:block;font-size:8px;letter-spacing:1px;text-transform:uppercase;color:var(--dim);margin-bottom:3px}
input,textarea,select{width:100%;background:var(--s2);border:1px solid var(--br2);color:var(--text);padding:7px 9px;font-family:inherit;font-size:11px}
input:focus,textarea:focus,select:focus{outline:1px solid var(--gold)}
textarea{resize:vertical;min-height:65px}
select{cursor:pointer}

/* Stat cards */
.stats-row{display:flex;gap:7px;margin-bottom:18px;flex-wrap:wrap}
.stat-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:12px 14px;flex:1;min-width:90px}
.stat-card.danger{border-top-color:var(--red)}
.stat-card.success{border-top-color:var(--green)}
.stat-value{font-size:20px;color:var(--gold);font-weight:bold}
.stat-card.danger .stat-value{color:var(--red)}
.stat-card.success .stat-value{color:var(--green)}
.stat-label{font-size:8px;color:var(--dim);letter-spacing:1px;text-transform:uppercase;margin-top:3px}
.stat-sub{font-size:8px;color:var(--dim);margin-top:2px}

.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:6px}
.section-title{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}
.section-actions{display:flex;gap:5px;flex-wrap:wrap}

.info-panel{background:var(--bF);border:1px solid var(--blue);border-left:4px solid var(--blue);padding:9px 13px;color:#9ec5ff;font-size:10px;margin-bottom:11px}
.info-panel strong{color:#fff}
.alert-strip{background:var(--gf);border:1px solid var(--gold);border-left:4px solid var(--gold);padding:9px 13px;margin-bottom:7px;font-size:10px;color:var(--gold);display:flex;justify-content:space-between;align-items:center}
.alert-strip.danger{background:var(--rf);border-color:var(--red);color:var(--red)}

.forecast-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:18px}
.forecast-card{background:var(--s1);border:1px solid var(--br);padding:14px;text-align:center}
.forecast-card.conservative{border-top:2px solid var(--dim)}
.forecast-card.base{border-top:2px solid var(--gold)}
.forecast-card.upside{border-top:2px solid var(--green)}
.forecast-val{font-size:20px;font-weight:bold;color:var(--gold)}
.forecast-card.conservative .forecast-val{color:var(--dim)}
.forecast-card.upside .forecast-val{color:var(--green)}
.forecast-label{font-size:8px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.forecast-desc{font-size:9px;color:var(--dim);margin-top:5px}

.pipeline-row{display:flex;gap:7px;margin-bottom:7px}
.pipeline-stage-label{font-size:8px;color:var(--dim);width:100px;flex-shrink:0;padding-top:4px;letter-spacing:1px}
.pipeline-bar-wrap{flex:1;background:var(--s2);height:22px;position:relative;border:1px solid var(--br)}
.pipeline-bar-fill{height:100%;background:var(--gold);opacity:.6;transition:width .4s}
.pipeline-bar-label{position:absolute;right:5px;top:50%;transform:translateY(-50%);font-size:8px;color:var(--text)}
.pipeline-ev{width:70px;text-align:right;font-size:9px;color:var(--gold);padding-top:3px}

.obj-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:11px 13px;margin-bottom:7px}
.obj-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px}
.obj-type{font-size:10px;color:var(--gold);letter-spacing:1px}
.obj-vertical{font-size:8px;color:var(--dim)}
.obj-counter{font-size:9px;color:#aaa;margin-bottom:5px;line-height:1.5}

.sequence-card{background:var(--s1);border:1px solid var(--br);padding:13px;margin-bottom:7px}
.sequence-header{display:flex;justify-content:space-between;margin-bottom:9px;flex-wrap:wrap;gap:5px}
.sequence-title{font-size:11px;margin-bottom:2px;font-weight:bold}
.sequence-meta{font-size:9px;color:var(--dim)}
.sequence-steps{display:flex;margin-bottom:9px}
.step{flex:1;padding:5px 3px;border:1px solid var(--br);font-size:8px;text-align:center;color:var(--dim);background:var(--s2)}
.step.done{border-color:var(--green);color:var(--green);background:var(--grF)}
.step.active{border-color:var(--gold);color:var(--gold);background:var(--gf)}
.sequence-actions{display:flex;gap:4px;flex-wrap:wrap}

.queue-card{background:var(--s1);border:1px solid var(--br);border-left:3px solid var(--gold);padding:13px;margin-bottom:7px}
.queue-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px}
.queue-card-title{font-size:11px;margin-bottom:2px;font-weight:bold}
.queue-card-meta{font-size:9px;color:var(--dim)}
.queue-card-body{font-size:10px;color:#999;margin-bottom:7px;line-height:1.5}
.queue-card-actions{display:flex;gap:4px;flex-wrap:wrap}

.meeting-card{background:var(--s1);border:1px solid var(--br);padding:13px;margin-bottom:7px}
.meeting-header{display:flex;justify-content:space-between;margin-bottom:7px;flex-wrap:wrap;gap:5px}

.log-entry{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--br);font-size:9px}
.log-time{color:var(--dim);white-space:nowrap;min-width:120px}
.log-actor{color:var(--gold);min-width:65px}
.log-action{color:var(--text)}

.dossier{background:var(--s2);border:1px solid var(--br);padding:13px;font-size:11px;line-height:1.8}
.dossier h4{color:var(--gold);letter-spacing:1px;text-transform:uppercase;font-size:9px;margin:10px 0 3px;border-bottom:1px solid var(--br);padding-bottom:2px}
.dossier p{color:#aaa}
.score-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:9px}
.score-row{background:var(--s2);border:1px solid var(--br);padding:5px 9px}
.score-row-label{font-size:8px;color:var(--dim);letter-spacing:1px}
.score-row-val{font-size:12px;color:var(--gold);font-weight:bold;margin-top:2px}

.agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:9px;margin-bottom:14px}
.agent-card{background:var(--s1);border:1px solid var(--br);border-top:2px solid var(--gold);padding:11px 13px;display:flex;flex-direction:column;gap:5px}
.agent-card h4{font-size:10px;color:var(--gold);letter-spacing:1px;text-transform:uppercase}
.agent-card p{font-size:9px;color:var(--dim);line-height:1.4}
.agent-card .agent-meta{display:flex;justify-content:space-between;font-size:8px;color:var(--dim)}
.agent-conflict{background:var(--rf);border:1px solid var(--red);color:var(--red);padding:2px 5px;font-size:8px;letter-spacing:1px}

.conflict-list{display:flex;flex-direction:column;gap:7px}
.conflict-item{background:var(--s1);border:1px solid var(--br);padding:9px 11px}
.conflict-item h5{font-size:9px;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:3px}
.conflict-item p{font-size:9px;color:#aaa;margin-bottom:3px}
.conflict-status{font-size:8px;letter-spacing:1px;text-transform:uppercase}
.conflict-status.pending{color:var(--gold)}
.conflict-status.resolved{color:var(--green)}

.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.sim-card{background:var(--s1);border:1px solid var(--br);padding:13px}
.sim-card h4{font-size:9px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:7px}
.sim-inputs{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.sim-output{margin-top:11px;background:var(--s2);border:1px solid var(--br);padding:11px;font-size:10px;line-height:1.6;color:#cfd6ff;min-height:90px;white-space:pre-wrap}

.constraints-panel{background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:11px}
.constraints-panel h4{font-size:9px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:7px}
.constraints-panel ol{padding-left:15px;font-size:10px;line-height:1.6;color:#ccc}
.constraints-panel li{margin-bottom:3px}
.constraints-subgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px}
.constraints-subgrid div{background:var(--s2);border:1px solid var(--br);padding:9px;font-size:9px;line-height:1.5}
.constraints-subgrid strong{color:var(--gold);display:block;margin-bottom:2px;letter-spacing:1px}

.disc-log{background:var(--bg);border:1px solid var(--br);padding:9px;font-size:9px;max-height:160px;overflow-y:auto;margin-top:11px;color:var(--dim)}
.discovery-toggle{display:flex;gap:5px;align-items:center;margin-bottom:13px;flex-wrap:wrap}
.disc-mode-btn{border:1px solid var(--br2);background:transparent;color:var(--dim);padding:4px 11px;font-size:8px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;font-family:inherit}
.disc-mode-btn.active-OFF{border-color:var(--dim);color:var(--dim)}
.disc-mode-btn.active-SEARCHING{border-color:var(--green);color:var(--green);background:var(--grF)}
.disc-mode-btn.active-PAUSED{border-color:var(--gold);color:var(--gold);background:var(--gf)}

.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.chart-card{background:var(--s1);border:1px solid var(--br);padding:14px}
.chart-card-title{font-size:8px;color:var(--dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:11px}
.chart-card.full{grid-column:span 2}

.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;align-items:center;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:var(--s1);border:2px solid var(--gold);width:540px;max-width:95vw;max-height:90vh;overflow-y:auto}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:13px 16px;border-bottom:1px solid var(--br)}
.modal-title{color:var(--gold);letter-spacing:2px;text-transform:uppercase;font-size:10px}
.modal-close{background:none;border:none;color:var(--dim);cursor:pointer;font-size:17px}
.modal-body{padding:16px}
.modal-footer{padding:11px 16px;border-top:1px solid var(--br);display:flex;gap:5px;justify-content:flex-end}

#toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--s1);border:1px solid var(--gold);color:var(--gold);padding:9px 20px;font-size:10px;letter-spacing:1px;z-index:9999;display:none}
.constraint-reminder-item{font-size:8px;padding:2px 0;color:var(--dim)}

::-webkit-scrollbar{width:3px;height:3px}
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
}
</style>
</head>
<body>

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

<!-- TOPBAR -->
<div class="topbar">
  <div>
    <div class="logo-main">TRESTLEBOARD</div>
    <div class="logo-sub">REVENUE OPERATIONS SYSTEM</div>
  </div>
  <div class="top-controls">
    <span style="font-size:8px;color:var(--dim);letter-spacing:1px;text-transform:uppercase">MODE</span>
    <div id="mode-selector" style="display:flex;gap:3px">
      <button class="mode-btn manual" data-mode="MANUAL" onclick="setAutonomyMode('MANUAL')">MANUAL</button>
      <button class="mode-btn semi" data-mode="SEMI-AUTO" onclick="setAutonomyMode('SEMI-AUTO')">SEMI</button>
      <button class="mode-btn full" data-mode="FULL AUTO" onclick="setAutonomyMode('FULL AUTO')">FULL</button>
    </div>
    <button class="btn sm brief-btn" onclick="openStrategicBrief()">BRIEF</button>
  </div>
</div>

<!-- MAIN NAV -->
<div class="main-nav">
  <button class="nav-pill active" onclick="showPage('command',this)">COMMAND</button>
  <button class="nav-pill" onclick="showPage('pipeline',this)">PIPELINE</button>
  <button class="nav-pill" onclick="showPage('intel',this)">
    INTEL <span class="badge intel-alert-badge" id="nav-intel-badge" style="display:none">0</span>
  </button>
</div>

<!-- ═══════════════ COMMAND PAGE ═══════════════ -->
<div class="page active" id="page-command">

  <!-- Intel waiting banner -->
  <div class="intel-banner" id="intel-banner"
       onclick="showPage('intel',document.querySelector('.main-nav .nav-pill:nth-child(3)'))">
    <div class="intel-banner-inner">
      <div class="intel-banner-text">
        <h3 id="intel-banner-msg">CONTACTS WAITING FOR REVIEW</h3>
        <p>Go to Intel, expand any card, click ADD TO PIPELINE.</p>
      </div>
      <span class="intel-banner-arrow">&#8594;</span>
    </div>
  </div>

  <div id="alert-container"></div>

  <!-- 4 stat tiles -->
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

  <!-- Command split body -->
  <div class="cmd-body">
    <div class="cmd-left">
      <div class="blk-label">PRIORITY TARGETS</div>
      <div id="cmd-hot-leads">
        <div class="guide-box">
          <div class="guide-title">NO LEADS IN PIPELINE YET</div>
          <div class="guide-text">Contacts are waiting in your Intel tab.<br>Go there, tap a card, click ADD TO PIPELINE.</div>
          <button class="btn primary" onclick="showPage('intel',document.querySelector('.main-nav .nav-pill:nth-child(3)'))">GO TO INTEL</button>
        </div>
      </div>
    </div>
    <div class="cmd-right">
      <div class="blk-label">PIPELINE OVERVIEW</div>
      <div class="cmd-chart-card">
        <div class="cmd-chart-label">BY STAGE</div>
        <canvas id="mini-funnel-chart" height="120"></canvas>
      </div>
      <div class="cmd-chart-card">
        <div class="cmd-chart-label">LEAD HEALTH</div>
        <canvas id="mini-decay-chart" height="90"></canvas>
      </div>
      <div id="constraint-reminder" style="margin-top:10px;padding:9px;background:var(--s2);font-size:8px;color:var(--dim);line-height:1.6">
        MODE: <span id="mode-display" style="color:var(--gold)">SEMI-AUTO</span><br>
        Hard limits active. Contact wall enabled.
      </div>
    </div>
  </div>

  <!-- Hidden compat IDs -->
  <span id="cmd-stale" style="display:none"></span>
  <span id="cmd-briefings" style="display:none"></span>
  <span id="cmd-closed" style="display:none"></span>
  <span id="tm-leads" style="display:none"></span>
  <span id="tm-decay" style="display:none"></span>
  <span id="cmd-total" style="display:none"></span>
  <span id="cmd-contact-approved" style="display:none"></span>
  <span id="cmd-contact-locked" style="display:none"></span>
  <span id="nav-conflict-badge" style="display:none"></span>
  <span id="nav-discovery-indicator" style="display:none"></span>
  <div id="hold-info"></div>
  <div id="cmd-forecast-mini" style="display:none"></div>
  <div id="cmd-objections-mini" style="display:none"></div>
  <div id="constraints-banner" style="display:none"></div>
</div>

<!-- ═══════════════ PIPELINE PAGE ═══════════════ -->
<div class="page" id="page-pipeline">
  <div class="pipeline-header">
    <div class="pipeline-sub-nav">
      <button class="sub-pill active" onclick="showPipelineView('kanban',this)">BOARD</button>
      <button class="sub-pill" onclick="showPipelineView('table',this)">LIST</button>
    </div>
    <div style="display:flex;gap:5px">
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
  <button class="fab" id="fab-add" onclick="openAddLead()">+</button>
</div>

<!-- ═══════════════ INTEL PAGE ═══════════════ -->
<div class="page" id="page-intel">

  <!-- Discovery hero (contact cards) -->
  <div style="padding:18px;max-width:900px;margin:0 auto">
    <div id="discovery-hero"></div>
  </div>

  <!-- Accordion sub-sections -->
  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">ANALYTICS</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-analytics-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">REVENUE FORECAST</span>
    <span class="accordion-chevron">v</span>
  </div>
  <div class="accordion-body"><div id="section-forecast-inner"></div></div>

  <div class="accordion-header" onclick="toggleIntelPanel(this)">
    <span class="accordion-title">SIMULATION</span>
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

  <!-- Legacy discovery sub-system (hidden, used by original discovery mode) -->
  <div style="display:none" id="section-discovery-inner">
    <div class="discovery-toggle">
      <button id="disc-btn-OFF" class="disc-mode-btn active-OFF" onclick="setDiscoveryMode('OFF')">OFF</button>
      <button id="disc-btn-SEARCHING" class="disc-mode-btn" onclick="setDiscoveryMode('SEARCHING')">SEARCHING</button>
      <button id="disc-btn-PAUSED" class="disc-mode-btn" onclick="setDiscoveryMode('PAUSED')">PAUSED</button>
      <input id="disc-webhook-input" placeholder="Webhook URL (optional)" style="width:220px">
    </div>
    <table><tbody id="discovery-queue-tbody"></tbody></table>
    <ul id="disc-log-list"></ul>
  </div>

</div>

<!-- ═══════════════ MODALS ═══════════════ -->
<!-- Lead form modal -->
<div class="modal-overlay" id="modal-lead">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title" id="lead-modal-title">Lead</span>
      <button class="modal-close" onclick="closeModal('modal-lead')">&#215;</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="lead-id">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="form-group"><label>Name</label><input id="lead-name" placeholder="Full name"></div>
        <div class="form-group"><label>Organization</label><input id="lead-org" placeholder="Company"></div>
        <div class="form-group"><label>Email</label><input id="lead-email" placeholder="email@org.com"></div>
        <div class="form-group"><label>Contract Value ($)</label><input id="lead-value" type="number" placeholder="50000"></div>
        <div class="form-group"><label>Stage</label>
          <select id="lead-status">
            <option>Prospect</option><option>Qualified</option><option>Proposal</option>
            <option>Negotiation</option><option>Closed</option><option>Archived</option>
          </select>
        </div>
        <div class="form-group"><label>Vertical</label>
          <select id="lead-vertical">
            <option>Defense Contractor</option><option>Government</option><option>Healthcare</option>
            <option>Finance</option><option>Tech</option><option>Other</option>
          </select>
        </div>
        <div class="form-group"><label>Psych Profile</label>
          <select id="lead-psych">
            <option>Analytical</option><option>Driver</option><option>Expressive</option><option>Amiable</option>
          </select>
        </div>
        <div class="form-group"><label>Urgency (1-10)</label><input id="lead-urgency" type="number" min="1" max="10" value="5"></div>
        <div class="form-group"><label>Days in Stage</label><input id="lead-days" type="number" value="0"></div>
        <div class="form-group"><label>Manual Hold</label>
          <select id="lead-hold"><option value="false">No</option><option value="true">Yes</option></select>
        </div>
        <div class="form-group"><label>Contact Approved</label>
          <select id="lead-contact-approved"><option value="false">No</option><option value="true">Yes</option></select>
        </div>
      </div>
      <div class="form-group"><label>Notes / Intel</label><textarea id="lead-notes" rows="3"></textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div class="form-group"><label>Engagement Score (0-10)</label><input id="score-engagement" type="number" min="0" max="10" value="5"></div>
        <div class="form-group"><label>Response Speed (0-10)</label><input id="score-speed" type="number" min="0" max="10" value="5"></div>
        <div class="form-group"><label>Strategic Fit (0-10)</label><input id="score-fit" type="number" min="0" max="10" value="5"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div class="form-group"><label>NBA Primary</label><input id="nba-primary" placeholder="Next action"></div>
        <div class="form-group"><label>NBA Fallback</label><input id="nba-fallback" placeholder="Fallback"></div>
        <div class="form-group"><label>NBA Escalation</label><input id="nba-escalation" placeholder="Escalation"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn danger sm" onclick="closeModal('modal-lead')">CANCEL</button>
      <button class="btn primary sm" onclick="saveLead()">SAVE LEAD</button>
    </div>
  </div>
</div>

<!-- Dossier modal -->
<div class="modal-overlay" id="modal-dossier">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Lead Dossier</span>
      <button class="modal-close" onclick="closeModal('modal-dossier')">&#215;</button>
    </div>
    <div class="modal-body" id="dossier-body"></div>
    <div class="modal-footer">
      <button class="btn sm" onclick="closeModal('modal-dossier')">CLOSE</button>
    </div>
  </div>
</div>

<!-- Strategic brief modal -->
<div class="modal-overlay" id="modal-strategic">
  <div class="modal" style="width:680px">
    <div class="modal-header">
      <span class="modal-title">Strategic Brief</span>
      <button class="modal-close" onclick="closeModal('modal-strategic')">&#215;</button>
    </div>
    <div class="modal-body" id="strategic-brief-body"></div>
    <div class="modal-footer">
      <button class="btn sm" onclick="closeModal('modal-strategic')">CLOSE</button>
    </div>
  </div>
</div>

<!-- Contact approve modal -->
<div class="modal-overlay" id="modal-contact-approve">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Approve Contact</span>
      <button class="modal-close" onclick="closeModal('modal-contact-approve')">&#215;</button>
    </div>
    <div class="modal-body" id="contact-approve-text"></div>
    <div class="modal-footer">
      <button class="btn danger sm" onclick="closeModal('modal-contact-approve')">CANCEL</button>
      <button class="btn success sm" id="contact-approve-confirm" onclick="">APPROVE</button>
    </div>
  </div>
</div>

<!-- Objection modal -->
<div class="modal-overlay" id="modal-objection">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Objection</span>
      <button class="modal-close" onclick="closeModal('modal-objection')">&#215;</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="obj-id">
      <div class="form-group"><label>Outcome</label>
        <select id="obj-outcome"><option>Unresolved</option><option>Resolved</option><option>Escalated</option></select>
      </div>
      <div class="form-group"><label>Type</label><input id="obj-type"></div>
      <div class="form-group"><label>Vertical</label><input id="obj-vertical"></div>
      <div class="form-group"><label>Objection</label><textarea id="obj-text" rows="2"></textarea></div>
      <div class="form-group"><label>Counter</label><textarea id="obj-counter" rows="2"></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn sm" onclick="closeModal('modal-objection')">CANCEL</button>
      <button class="btn primary sm" onclick="saveObjection()">SAVE</button>
    </div>
  </div>
</div>

<!-- Conflict modal -->
<div class="modal-overlay" id="modal-conflict">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Conflict</span>
      <button class="modal-close" onclick="closeModal('modal-conflict')">&#215;</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="conflict-id">
      <div class="form-group"><label>Deal</label><input id="conflict-deal"></div>
      <div class="form-group"><label>Agent A</label><input id="conflict-agent-a"></div>
      <div class="form-group"><label>Agent B</label><input id="conflict-agent-b"></div>
      <div class="form-group"><label>Options</label><textarea id="conflict-options" rows="2"></textarea></div>
      <div class="form-group"><label>Status</label>
        <select id="conflict-status"><option>pending</option><option>resolved</option></select>
      </div>
      <div class="form-group"><label>Resolution</label><textarea id="conflict-resolution" rows="2"></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn sm" onclick="closeModal('modal-conflict')">CANCEL</button>
      <button class="btn primary sm" onclick="saveConflict()">SAVE</button>
    </div>
  </div>
</div>

<!-- Campaign modal -->
<div class="modal-overlay" id="modal-campaign">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Campaign</span>
      <button class="modal-close" onclick="closeModal('modal-campaign')">&#215;</button>
    </div>
    <div class="modal-body">
      <div class="form-group"><label>Name</label><input id="camp-name"></div>
      <div class="form-group"><label>Vertical</label><input id="camp-vertical"></div>
      <div class="form-group"><label>Type</label><input id="camp-type"></div>
      <div class="form-group"><label>Brief</label><textarea id="camp-brief" rows="3"></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn sm" onclick="closeModal('modal-campaign')">CANCEL</button>
      <button class="btn primary sm" onclick="saveCampaign()">SAVE</button>
    </div>
  </div>
</div>

<!-- Brief modal -->
<div class="modal-overlay" id="modal-brief">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Brief</span>
      <button class="modal-close" onclick="closeModal('modal-brief')">&#215;</button>
    </div>
    <div class="modal-body">
      <div class="form-group"><label>Title</label><input id="brief-title"></div>
      <div class="form-group"><label>Body</label><textarea id="brief-body" rows="4"></textarea></div>
      <div class="form-group"><label>Type</label><input id="brief-type"></div>
      <div class="form-group"><label>Priority</label>
        <select id="brief-priority"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn sm" onclick="closeModal('modal-brief')">CANCEL</button>
      <button class="btn primary sm" onclick="saveBrief()">SAVE</button>
    </div>
  </div>
</div>

<!-- Meeting modal -->
<div class="modal-overlay" id="modal-meeting">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title">Meeting</span>
      <button class="modal-close" onclick="closeModal('modal-meeting')">&#215;</button>
    </div>
    <div class="modal-body">
      <div class="form-group"><label>Lead</label><input id="meeting-lead"></div>
      <div class="form-group"><label>Date / Time</label><input id="meeting-datetime" type="datetime-local"></div>
      <div class="form-group"><label>Format</label>
        <select id="meeting-format"><option>Virtual</option><option>In-Person</option><option>Phone</option></select>
      </div>
      <div class="form-group"><label>Notes</label><textarea id="meeting-notes" rows="3"></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn sm" onclick="closeModal('modal-meeting')">CANCEL</button>
      <button class="btn primary sm" onclick="saveMeeting()">SAVE</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<script src="data.js"><\/script>
<script>
${js}

// ══ POST-JS ADDITIONS (no re-declarations) ═════════════════

// Build timestamp
(function() {
  var el = document.getElementById('build-ts');
  if (el) {
    try {
      var d = new Date('${BT}');
      el.textContent = d.toLocaleString('en-US', {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) + ' ET';
    } catch(e) { el.textContent = 'recent'; }
  }
})();

// Sync intel banner + badge
function _syncIntelBanner() {
  var q = (state && state.discoveryQueue) || [];
  var banner = document.getElementById('intel-banner');
  var badge  = document.getElementById('nav-intel-badge');
  var count  = document.getElementById('cmd-intel-count');
  var msg    = document.getElementById('intel-banner-msg');
  if (q.length > 0) {
    if (banner) banner.classList.add('show');
    if (badge)  { badge.style.display = 'inline-flex'; badge.textContent = q.length; }
    if (count)  count.textContent = q.length;
    if (msg)    msg.textContent = q.length + ' CONTACTS WAITING FOR REVIEW';
  } else {
    if (banner) banner.classList.remove('show');
    if (badge)  badge.style.display = 'none';
    if (count)  count.textContent = '0';
  }
}

// Mini charts for command page
var _mFC = null, _mDC = null;
function _renderCmdCharts() {
  var sl = (window.CLAW && window.CLAW.CONFIG && window.CLAW.CONFIG.STAGES) || [];
  var sc = sl.map(function(s) { return state.leads.filter(function(l) { return l.status === s; }).length; });
  var fe = document.getElementById('mini-funnel-chart');
  if (fe && window.Chart) {
    if (_mFC) _mFC.destroy();
    _mFC = new Chart(fe, { type:'bar', data:{labels:sl,datasets:[{data:sc,backgroundColor:'#e8b84b33',borderColor:'#e8b84b',borderWidth:1}]}, options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#505570',font:{size:8}},grid:{color:'#1e2232'}},y:{ticks:{color:'#505570',font:{size:8}},grid:{display:false}}}} });
  }
  var ac = state.leads.filter(function(l) { return l.status !== 'Archived'; });
  var fr = ac.filter(function(l) { return decayDays(l) <= 1; }).length;
  var wn = ac.filter(function(l) { return decayDays(l) > 1 && decayDays(l) <= 3; }).length;
  var cr = ac.filter(function(l) { return decayDays(l) > 3; }).length;
  var de = document.getElementById('mini-decay-chart');
  if (de && window.Chart) {
    if (_mDC) _mDC.destroy();
    _mDC = new Chart(de, { type:'doughnut', data:{labels:['Good','Watch','Cold'],datasets:[{data:[fr||1,wn,cr],backgroundColor:['#2ec76e33','#e8b84b33','#e03e3e33'],borderColor:['#2ec76e','#e8b84b','#e03e3e'],borderWidth:1}]}, options:{cutout:'65%',plugins:{legend:{labels:{color:'#505570',font:{size:8},boxWidth:8}}}} });
  }
}

// Discovery hero (contact cards) — does NOT redeclare renderDiscoveryHero
function _renderDiscoveryHero() {
  var el = document.getElementById('discovery-hero');
  if (!el) return;
  var q = (state && state.discoveryQueue) || [];
  if (!q.length) {
    el.innerHTML = '<div class="guide-box"><div class="guide-title">NO INTEL YET</div><div class="guide-text">Queue is empty. Click Reload to restore all contacts.</div><button class="btn primary" onclick="_reloadAllLeads()">RELOAD CONTACTS</button></div>';
    return;
  }
  var vmap = {};
  q.forEach(function(item) { var v = item.vertical || 'Other'; if (!vmap[v]) vmap[v] = []; vmap[v].push(item); });
  var html = '<div class="intel-count-bar"><div><div class="intel-count-num">' + q.length + '</div><div class="intel-count-label">VERIFIED CONTACTS — TAP CARD TO EXPAND</div></div><button class="btn sm" onclick="_reloadAllLeads()">RELOAD ALL</button></div>';
  html += '<div style="font-size:8px;color:var(--dim);margin-bottom:11px">Green = high confidence (85%+) | Gold = medium (70-84%) | Gray = lower</div>';
  Object.keys(vmap).forEach(function(v) {
    var items = vmap[v];
    html += '<div class="vgroup-label">' + v + ' (' + items.length + ')</div>';
    items.forEach(function(item) {
      var cc = item.confidence >= 85 ? 'conf-high' : item.confidence >= 70 ? 'conf-med' : 'conf-low';
      var lines = (item.intel || '').split('\\n');
      var firstLine = lines[0] || '';
      var emailLine = lines.find(function(l) { return l.toLowerCase().indexOf('email') > -1; }) || '';
      var liLine    = lines.find(function(l) { return l.toLowerCase().indexOf('linkedin') > -1; }) || '';
      var emailMatch = emailLine.match(/:\\s*([^\\s(]+@[^\\s]+)/);
      var emailVal   = emailMatch ? emailMatch[1].trim() : '';
      var liMatch    = liLine.match(/(linkedin\\.com\\/in\\/[^\\s]+)/i);
      var liVal      = liMatch ? liMatch[1] : '';
      var cid = item.id;
      html += '<div class="ccard" id="card-' + cid + '">';
      html += '<div class="ccard-top" onclick="_toggleCard(this)" data-id="' + cid + '"><div class="ccard-conf ' + cc + '">' + item.confidence + '%</div>';
      html += '<div class="ccard-info"><div class="ccard-name">' + (item.name || 'Unknown') + '</div>';
      html += '<div class="ccard-role">' + firstLine.substring(0, 70) + '</div>';
      html += '<div class="ccard-org">' + (item.org || '') + '</div>';
      if (item.location) html += '<div class="ccard-loc">' + item.location + '</div>';
      html += '</div><div class="ccard-quick-btns">';
      if (emailVal) html += '<a href="mailto:' + emailVal + '" class="btn xs primary" onclick="event.stopPropagation()">EMAIL</a>';
      if (liVal)    html += '<a href="https://' + liVal + '" target="_blank" class="btn xs" onclick="event.stopPropagation()">LINKEDIN</a>';
      html += '</div></div>';
      html += '<div class="ccard-body" id="body-' + cid + '">';
      html += '<div class="intel-txt">' + (item.intel || '').replace(/</g, '&lt;') + '</div>';
      html += '<div class="ccard-foot">';
      html += '<button class="btn success sm" data-discid="' + cid + '" onclick="_addToP(this)">ADD TO PIPELINE</button>';
      html += '<button class="btn-start-pipeline locked" data-discid="' + cid + '" onclick="_startP(this)">START PIPELINE</button>';
      html += '<button class="btn danger sm" data-discid="' + cid + '" onclick="_dismissP(this)">DISMISS</button>';
      html += '</div></div></div>';
    });
  });
  el.innerHTML = html;
}

function _toggleCard(el) {
  var id = el.getAttribute('data-id');
  var b = document.getElementById('body-' + id);
  if (b) b.classList.toggle('expanded');
}
function _addToP(btn) { importDiscoveryLead(btn.getAttribute('data-discid')); }
function _dismissP(btn) { dismissDiscoveryLead(btn.getAttribute('data-discid')); }
function _startP(btn) {
  var discId = btn.getAttribute('data-discid');
  var qItem = (state.discoveryQueue || []).find(function(x) { return x.id === discId; });
  var lead  = state.leads.find(function(l) { return l.name === (qItem && qItem.name); });
  if (lead && lead.contactApproved) { toast('Pipeline started for ' + lead.name); log('PIPELINE START', 'Lead: ' + lead.name); }
  else if (lead) { toast('LOCKED — Approve contact in Pipeline first.'); }
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
  _renderDiscoveryHero();
  _syncIntelBanner();
  toast('Reloaded — ' + (state.discoveryQueue || []).length + ' contacts');
}

// Patch showPage to also trigger our additions
var _origSP = typeof showPage === 'function' ? showPage : function(){};
showPage = function(pageId, btn) {
  _origSP(pageId, btn);
  if (pageId === 'intel') { _renderDiscoveryHero(); _syncIntelBanner(); }
  if (pageId === 'command') { _syncIntelBanner(); _renderCmdCharts(); }
};

// Patch renderAll
var _origRA = typeof renderAll === 'function' ? renderAll : function(){};
renderAll = function() {
  _origRA();
  _syncIntelBanner();
  _renderCmdCharts();
  var a = state.leads.filter(function(l) { return !['Closed','Archived'].includes(l.status); });
  var evEl = document.getElementById('tm-pipeline'); if (evEl) { var ev = calcEV(); evEl.textContent = '$' + fmtNum(Math.round(ev.base)); }
  var aEl  = document.getElementById('cmd-active');  if (aEl)  aEl.textContent = a.length;
  var dEl  = document.getElementById('cmd-decay');   if (dEl)  dEl.textContent = a.filter(function(l){return decayDays(l)>1;}).length;
  var ts   = document.getElementById('cmd-total-sub'); if (ts) ts.textContent = state.leads.length + ' total';
  var md   = document.getElementById('mode-display'); if (md)  md.textContent = state.autonomyMode || 'SEMI-AUTO';
};

// On load
window.addEventListener('load', function() {
  _syncIntelBanner();
  _renderCmdCharts();
});

<\/script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Built:', html.split('\n').length, 'lines,', Math.round(html.length/1024) + 'KB');
