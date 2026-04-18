const fs = require('fs');

// 1. mockData.ts 처리
let mockData = fs.readFileSync('src/data/mockData.ts', 'utf8');
mockData = mockData.replace(/team:\s*'[^']+',?\s*/g, '');
fs.writeFileSync('src/data/mockData.ts', mockData);

// 2. App.tsx 처리
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// UserDetailModal 인자 및 상태 제거
appTsx = appTsx.replace(/, onUpdate: \(team: string\) => void/g, '');
appTsx = appTsx.replace(/, onUpdate/g, '');
appTsx = appTsx.replace(/, team: 'UNKNOWN'/g, '');
appTsx = appTsx.replace(/const \[newTeam, setNewTeam\] = useState\(user\.team\)/g, '');

// UserDetailModal JSX 편집 모드 제거 (복잡한 정규식 대신 문자열 매칭 활용)
const editModeStr = `{editMode ? (
                <div className="flex items-center gap-2 mt-1">
                  <input type="text" value={newTeam} onChange={e => setNewTeam(e.target.value)} className="px-2 py-1 text-sm border border-slate-300 rounded outline-none" />
                  <button type="button" onClick={() => { onUpdate(newTeam); setEditMode(false) }} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded">저장</button>
                  <button type="button" onClick={() => { setNewTeam(user.team); setEditMode(false) }} className="px-3 py-1 text-xs font-bold text-slate-600 bg-slate-200 rounded">취소</button>
                </div>
              ) : (
                <p className="m-0 text-sm text-slate-500 mt-1 flex items-center gap-2">
                  소속: {user.team}
                  <button type="button" onClick={() => setEditMode(true)} className="text-blue-500 hover:text-blue-700"><SquarePen size={14} /></button>
                </p>
              )}`;
appTsx = appTsx.replace(editModeStr, '');

// ID 출력에서 team 제거
appTsx = appTsx.replace(/_{user\.team\.replace\(\/\\\\s\/g, ''\)}/g, '');

// Dashboard Widget - riskUsers team span 제거
appTsx = appTsx.replace(/<span className="text-xs text-slate-500">{u\.team}<\/span>/g, '');

// Live Monitoring - user team span 제거
appTsx = appTsx.replace(/<span className="text-xs text-slate-500 mb-3">{user\.team}<\/span>/g, '');
appTsx = appTsx.replace(/<span className="text-xs text-slate-500">{alert\.team}<\/span>/g, '');

// Members Tab - 검색 & 필터
appTsx = appTsx.replace(/const \[membersTeamFilter, setMembersTeamFilter\] = useState\('all'\)/g, '');
appTsx = appTsx.replace(/<select value={membersTeamFilter} onChange={e => setMembersTeamFilter\(e\.target\.value\)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm font-medium">\s*<option value="all">모든 부서<\/option>\s*{Array\.from\(new Set\(riskUsersState\.map\(u => u\.team\)\)\)\.map\(t => <option key={t} value={t}>{t}<\/option>\)}\s*<\/select>/g, '');
appTsx = appTsx.replace(/이름 또는 부서 검색/g, '이름 검색');
appTsx = appTsx.replace(/<th className="p-4 font-bold border-b border-slate-100">부서<\/th>/g, '');
appTsx = appTsx.replace(/<td className="p-4 text-slate-600">{u\.team}<\/td>/g, '');
appTsx = appTsx.replace(/\(membersTeamFilter === 'all' \|\| u\.team === membersTeamFilter\) && u\.name\.includes\(membersQuery\)/g, 'u.name.includes(membersQuery)');

// Alerts Tab - 테이블
appTsx = appTsx.replace(/<th className="p-4 font-bold border-b border-slate-100">소속<\/th>/g, '');
appTsx = appTsx.replace(/<td className="p-4 text-slate-600">{item\.team}<\/td>/g, '');

// Statistics Tab - Top 5
appTsx = appTsx.replace(/<span className="text-xs text-slate-500">{userMeta\?\.team \|\| '알 수 없음'}<\/span>/g, '');

// Add Member Modal
appTsx = appTsx.replace(/const \[team, setTeam\] = useState\('운수팀 A'\)/g, '');
appTsx = appTsx.replace(/이메일과 소속을 입력하세요\./g, '이메일을 입력하세요.');
const addTeamInputStr = `<div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">초기 소속 (팀)</label>
                  <input type="text" placeholder="소속 팀 입력" value={team} onChange={e => setTeam(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" required />
                </div>`;
appTsx = appTsx.replace(addTeamInputStr, '');

// Export CSV
appTsx = appTsx.replace(/,Team/g, '');
appTsx = appTsx.replace(/,\$\{a\.team\}/g, '');

// App() 호출부
appTsx = appTsx.replace(/onUpdate={\(team\) => { setRiskUsersState\(prev => prev\.map\(u => u\.name === selectedUserForDetail \? { \.\.\.u, team } : u\)\) }}/g, '');

fs.writeFileSync('src/App.tsx', appTsx);
