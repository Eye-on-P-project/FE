import { useState } from 'react';
import { Shield, Building2, Check, Search, ChevronRight, AlertCircle, FileText, ArrowLeft, Download, Paperclip } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { mockOrganizationSignupRequests } from './data/mockAdminData';
import type { OrganizationSignupRequest } from './types/admin';

export default function SystemAdminApp() {
  const [requests, setRequests] = useState<OrganizationSignupRequest[]>(mockOrganizationSignupRequests);
  const [selectedRequest, setSelectedRequest] = useState<OrganizationSignupRequest | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReasons, setRejectReasons] = useState({
    infoMismatch: false,
    unverified: false,
    other: false,
  });
  const [rejectOtherText, setRejectOtherText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingRequests = requests.filter(r => r.status === 'PENDING' && (
    r.b_nm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.p_nm.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const handleAccept = (request: OrganizationSignupRequest) => {
    // 실제 서버 요청이 들어갈 자리입니다.
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'ACCEPTED' } : r));
    setSelectedRequest(null);
    toast.success(`${request.b_nm || request.p_nm} 조직의 가입이 수락되었습니다.`);
  };

  const openRejectModal = (request: OrganizationSignupRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
    setRejectReasons({ infoMismatch: false, unverified: false, other: false });
    setRejectOtherText('');
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    
    const hasReason = rejectReasons.infoMismatch || rejectReasons.unverified || (rejectReasons.other && rejectOtherText.trim());
    if (!hasReason) {
      toast.error('거절 사유를 선택하거나 입력해주세요.');
      return;
    }

    // 실제 서버 요청이 들어갈 자리입니다.
    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'REJECTED' } : r));
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
    toast.success(`${selectedRequest.b_nm || selectedRequest.p_nm} 조직의 가입이 거절되었습니다.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col h-full sticky top-0 border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight m-0 leading-tight">System Admin</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Portal</span>
          </div>
        </div>
        
        <nav className="p-4 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-bold transition-colors w-full text-left">
            <Building2 size={20} />
            조직 가입 승인
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 flex flex-col relative">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shrink-0">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight m-0">조직 가입 대기 목록</h2>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
          {!selectedRequest ? (
            /* List View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="상호명, 대표자 검색" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="text-sm font-bold text-slate-500">
                  대기 중: <span className="text-indigo-600">{pendingRequests.length}</span>건
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-bold">요청 일시</th>
                      <th className="px-6 py-4 font-bold">상호명 (대표자)</th>
                      <th className="px-6 py-4 font-bold">사업자번호</th>
                      <th className="px-6 py-4 font-bold">사업자 등록 확인</th>
                      <th className="px-6 py-4 font-bold w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.length > 0 ? pendingRequests.map(req => (
                      <tr 
                        key={req.id} 
                        onClick={() => setSelectedRequest(req)}
                        className="border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4">
                          <strong className="text-slate-900 block">{req.b_nm || '상호명 미기재'}</strong>
                          <span className="text-xs text-slate-500">{req.p_nm}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">{req.b_no}</td>
                        <td className="px-6 py-4">
                          {req.nts_valid === '01' && req.nts_status === '계속사업자' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                              <Check size={14} strokeWidth={2} /> 정상
                            </span>
                          ) : req.nts_valid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
                              <AlertCircle size={14} strokeWidth={2} /> 실패
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 text-xs font-bold border border-slate-200">
                              미확인
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          <ChevronRight size={18} />
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                          대기 중인 가입 요청이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Detail View (Full Screen) */
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit font-bold"
              >
                <ArrowLeft size={18} /> 목록으로 돌아가기
              </button>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-900 p-8 text-white">
                  <div className="inline-flex px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-md mb-4 shadow-sm">
                    검토 대기중
                  </div>
                  <h3 className="text-3xl font-black m-0 mb-2">{selectedRequest.b_nm || '상호명 미기재'}</h3>
                  <p className="text-slate-400 text-lg m-0">대표자: {selectedRequest.p_nm}</p>
                </div>

                <div className="p-8 flex flex-col md:flex-row gap-8">
                  {/* Left Column */}
                  <div className="flex-1 flex flex-col gap-8">
                    <section>
                      <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        <FileText size={20} className="text-indigo-600" /> 진위확인
                      </h4>
                      <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
                        {/* 국세청 응답 결과 강조 표시 */}
                        <div className={`p-4 rounded-xl border flex items-center justify-between mb-2 ${selectedRequest.nts_valid === '01' && selectedRequest.nts_status === '계속사업자' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                          <div>
                            <p className={`text-xs font-bold mb-1 ${selectedRequest.nts_valid === '01' && selectedRequest.nts_status === '계속사업자' ? 'text-emerald-600' : 'text-rose-600'}`}>사업자 등록 확인 결과</p>
                            <strong className={`text-base ${selectedRequest.nts_valid === '01' && selectedRequest.nts_status === '계속사업자' ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {selectedRequest.nts_valid_msg || '미확인'} 
                              {selectedRequest.nts_status && ` (${selectedRequest.nts_status})`}
                            </strong>
                          </div>
                          {selectedRequest.nts_valid === '01' && selectedRequest.nts_status === '계속사업자' ? (
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Check size={20} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                              <AlertCircle size={20} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-sm md:text-base">
                          <span className="text-slate-500 font-medium">사업자등록번호</span>
                          <strong className="font-mono text-slate-900 text-lg">{selectedRequest.b_no}</strong>
                        </div>
                        <div className="flex justify-between items-center text-sm md:text-base">
                          <span className="text-slate-500 font-medium">개업일자</span>
                          <strong className="text-slate-900">{selectedRequest.start_dt}</strong>
                        </div>
                        <div className="flex justify-between items-center text-sm md:text-base">
                          <span className="text-slate-500 font-medium">대표자성명</span>
                          <strong className="text-slate-900">{selectedRequest.p_nm}{selectedRequest.p_nm2 && `, ${selectedRequest.p_nm2}`}</strong>
                        </div>
                        {selectedRequest.b_adr && (
                          <div className="flex justify-between items-center text-sm md:text-base">
                            <span className="text-slate-500 font-medium">사업장주소</span>
                            <strong className="text-slate-900 text-right max-w-[60%]">{selectedRequest.b_adr}</strong>
                          </div>
                        )}
                        {selectedRequest.corp_no && (
                          <div className="flex justify-between items-center text-sm md:text-base">
                            <span className="text-slate-500 font-medium">법인등록번호</span>
                            <strong className="font-mono text-slate-900">{selectedRequest.corp_no}</strong>
                          </div>
                        )}
                      </div>
                    </section>
                    
                    <section>
                      <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        <Paperclip size={20} className="text-indigo-600" /> 첨부파일
                      </h4>
                      {selectedRequest.attachmentFileName ? (
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 m-0">{selectedRequest.attachmentFileName}</p>
                              <p className="text-xs text-slate-500 m-0 mt-0.5">업로드된 파일</p>
                            </div>
                          </div>
                          <a 
                            href={selectedRequest.attachmentUrl || '#'} 
                            download={selectedRequest.attachmentFileName}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-lg transition-colors border border-indigo-200"
                          >
                            <Download size={16} /> 다운로드
                          </a>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-6 text-center">
                          <p className="text-slate-500 text-sm m-0">첨부된 파일이 없습니다.</p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="flex-1 flex flex-col gap-8">
                    <section>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        신청자 정보
                      </h4>
                      <div className="bg-white rounded-xl p-5 space-y-4 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center text-sm md:text-base">
                          <span className="text-slate-500 font-medium">요청 이메일</span>
                          <strong className="text-slate-900">{selectedRequest.email}</strong>
                        </div>
                        <div className="flex justify-between items-center text-sm md:text-base">
                          <span className="text-slate-500 font-medium">요청 일시</span>
                          <strong className="text-slate-900">{new Date(selectedRequest.createdAt).toLocaleString('ko-KR')}</strong>
                        </div>

                      </div>
                    </section>

                    <div className="mt-auto bg-slate-50 rounded-xl p-6 border border-slate-200 flex gap-4">
                      <button 
                        onClick={() => openRejectModal(selectedRequest)}
                        className="flex-1 py-4 px-6 rounded-xl border-2 border-red-200 text-red-600 font-black text-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                      >
                        가입 거부
                      </button>
                      <button 
                        onClick={() => handleAccept(selectedRequest)}
                        className="flex-[2] py-4 px-6 rounded-xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2"
                      >
                        <Check size={24} strokeWidth={3} /> 수락 및 활성화
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-0 flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-black text-slate-900 m-0">가입 요청 거절</h3>
                <p className="text-sm text-slate-500 mt-1">
                  <strong>{selectedRequest.b_nm || selectedRequest.p_nm}</strong>의 요청을 거절합니다.<br/>
                  사유를 명확히 선택해주세요.
                </p>
              </div>
            </div>

            <div className="p-6 mt-2">
              <div className="space-y-3 flex flex-col">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50">
                  <input 
                    type="checkbox" 
                    checked={rejectReasons.infoMismatch}
                    onChange={(e) => setRejectReasons({...rejectReasons, infoMismatch: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600 rounded"
                  />
                  <span className="font-medium text-slate-700">사업자 등록 정보 불일치</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50">
                  <input 
                    type="checkbox" 
                    checked={rejectReasons.unverified}
                    onChange={(e) => setRejectReasons({...rejectReasons, unverified: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600 rounded"
                  />
                  <span className="font-medium text-slate-700">대표자 소속 확인 불가</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50">
                  <input 
                    type="checkbox" 
                    checked={rejectReasons.other}
                    onChange={(e) => setRejectReasons({...rejectReasons, other: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600 rounded"
                  />
                  <span className="font-medium text-slate-700">기타</span>
                </label>

                {rejectReasons.other && (
                  <div className="pl-8 mt-1">
                    <input 
                      type="text" 
                      placeholder="기타 사유를 입력해주세요" 
                      value={rejectOtherText}
                      onChange={(e) => setRejectOtherText(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-600 transition-colors"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleReject}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-600/20 transition-colors"
              >
                거부 처리 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
