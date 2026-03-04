const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const js = h.slice(h.lastIndexOf('<script>') + 8, h.lastIndexOf('</script>'));
fs.writeFileSync('_mainjs_check.js', js);
console.log('Written', js.length, 'bytes');
