const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const searchStr = `                <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:-translate-y-0.5 transition-transform">구성원 추가 완료</button>`;

const idx = content.lastIndexOf(searchStr);
if (idx !== -1) {
  const cutoff = content.indexOf('}\n', idx);
  if (cutoff !== -1) {
    const finalCutoff = content.indexOf('}\n', cutoff + 2);
    if (finalCutoff !== -1) {
      content = content.substring(0, finalCutoff + 2);
      fs.writeFileSync('src/App.tsx', content);
      console.log('Truncated successfully.');
    }
  }
}
