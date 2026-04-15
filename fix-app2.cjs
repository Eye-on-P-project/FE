const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const searchStr = `        </div>\n      )}\n    </div>\n  )\n}\n`;

const idx = content.indexOf(searchStr);
if (idx !== -1) {
  content = content.substring(0, idx + searchStr.length);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Truncated successfully to exact end block.');
} else {
  console.log('Not found');
}
