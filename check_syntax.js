const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const js = h.slice(h.lastIndexOf('<script>') + 8, h.lastIndexOf('</script>'));

// Write just the JS to a temp file and try to parse it
fs.writeFileSync('_tmp_check.js', `
// stub globals needed
const window = {};
const document = { addEventListener:()=>{}, getElementById:()=>null, querySelectorAll:()=>[], querySelector:()=>null };
const localStorage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{} };
const navigator = { userAgent:'' };
const Chart = function(){this.destroy=()=>{}};
const BUILD_TS = '';
const STORAGE_KEY = 'x';
const LEGACY_STORAGE_KEY = 'x';
const AUTH_META_KEY = 'x';
// Don't execute, just check syntax
`);

// Use node --check to syntax-check
const { execSync } = require('child_process');

// Write just the mainJS to check
fs.writeFileSync('_mainjs_check.js', '"use strict";\n' + js);
try {
  execSync('node --check _mainjs_check.js 2>&1', { stdio: 'pipe' });
  console.log('SYNTAX OK');
} catch(e) {
  const out = e.stderr ? e.stderr.toString() : e.stdout ? e.stdout.toString() : e.message;
  console.log('SYNTAX ERROR:\n' + out.slice(0, 2000));
}

// Cleanup
try { fs.unlinkSync('_mainjs_check.js'); fs.unlinkSync('_tmp_check.js'); } catch(e){}
