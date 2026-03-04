const fs = require('fs');
const h = fs.readFileSync('_source_utf8.html', 'utf8');

// Find auth-gate HTML
const ag = h.indexOf('id="auth-gate"');
console.log('auth-gate HTML at:', ag, ag > -1 ? h.slice(ag - 5, ag + 200) : 'NOT FOUND');

// Find modal HTML (not CSS)
let mi = 0;
while (true) {
  const m = h.indexOf('modal-overlay', mi);
  if (m === -1) break;
  console.log('modal-overlay at', m, ':', h.slice(Math.max(0,m-10), m+50));
  mi = m + 1;
}

// Show end of body to find auth gate if it's there
const bodyEnd = h.lastIndexOf('</body>');
console.log('\nEnd of body (-3000 chars from </body>):');
console.log(h.slice(Math.max(0, bodyEnd - 2000), bodyEnd));
