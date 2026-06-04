import { useState } from 'react';
import axios from 'axios';
// TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 주석 처리
// import { Shield, Building2, Check, FileText, ArrowLeft, Upload, Loader2, ListChecks } from 'lucide-react';
import { Shield, Building2, Check, FileText, ArrowLeft, Loader2, ListChecks } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { signupOrganizationAdmin } from './api/auth';

function toIsoDate(yyyymmdd: string) {
  const trimmed = yyyymmdd.trim();
  if (!/^\d{8}$/.test(trimmed)) {
    return null;
  }

  const year = Number(trimmed.slice(0, 4));
  const month = Number(trimmed.slice(4, 6));
  const day = Number(trimmed.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<{ message?: string; errors?: { field: string; reason: string }[] }>(error)) {
    const fieldError = error.response?.data?.errors?.[0]?.reason;
    if (fieldError) {
      return fieldError;
    }

    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return fallbackMessage;
}

export default function SignupApp() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    b_no: '',
    start_dt: '',
    p_nm: '',
    p_nm2: '',
    b_nm: '',
    corp_no: '',
    b_adr: '',
    email: '',
    password: '',
  });

  // TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 주석 처리
  // const [attachment, setAttachment] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 주석 처리
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setAttachment(e.target.files[0]);
  //   }
  // };

  const handleVerify = async () => {
    if (!formData.b_no || !formData.start_dt || !formData.p_nm || !formData.b_nm || !formData.corp_no) {
      toast.error('필수 항목(사업자등록번호, 상호명, 개업일자, 대표자성명, 법인등록번호)을 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    // Mock API Call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful verification
    setIsVerified(true);
    setIsVerifying(false);
    toast.success('사업자 등록 확인이 완료되었습니다. (계속사업자)');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error('사업자 등록 확인을 먼저 완료해주세요.');
      return;
    }
    const establishedAt = toIsoDate(formData.start_dt);
    if (!establishedAt) {
      toast.error('개업일자는 YYYYMMDD 형식의 올바른 날짜여야 합니다.');
      setStep(1);
      return;
    }

    if (formData.password.length < 4) {
      toast.error('비밀번호는 4자 이상 입력해주세요.');
      setStep(2);
      return;
    }

    // TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 주석 처리 (attachment 검증 및 메시지 수정)
    // if (!formData.email || !formData.password || !attachment) {
    //   toast.error('이메일, 비밀번호, 첨부파일을 모두 입력해주세요.');
    if (!formData.email || !formData.password) {
      toast.error('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signupOrganizationAdmin({
        email: formData.email.trim(),
        password: formData.password,
        organizationName: formData.b_nm.trim(),
        businessmanNum: formData.b_no.trim(),
        establishedAt,
        representativeName: formData.p_nm.trim(),
        corporateNum: formData.corp_no.trim(),
        businessName: formData.b_nm.trim(),
        coRepresentativeName: optionalText(formData.p_nm2),
        businessAddress: optionalText(formData.b_adr),
      });

      toast.success('회원가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: unknown) {
      toast.error(extractApiErrorMessage(error, '회원가입 신청에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center py-12 px-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight m-0">조직 회원가입</h1>
            <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">Organization Registration</span>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={18} /> 로그인 화면으로
        </button>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Step Indicator */}
        <div className="flex bg-slate-50 border-b border-slate-100 flex-col md:flex-row">
          <div className={`flex-1 p-4 flex items-center justify-center gap-2 font-bold text-sm transition-colors ${step >= 1 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
            사업자 등록 확인
          </div>
          <div className={`flex-1 p-4 flex items-center justify-center gap-2 font-bold text-sm transition-colors ${step >= 2 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            계정 정보 입력
          </div>
          <div className={`flex-1 p-4 flex items-center justify-center gap-2 font-bold text-sm transition-colors ${step >= 3 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
            최종 검토
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Step 1: NTS Verification */}
          <div className={`space-y-8 ${step === 1 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}`}>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <Shield className="text-blue-600" size={20} /> 필수 사업자 정보 입력
              </h2>
              <p className="text-sm text-slate-500">안전한 서비스 제공을 위해 국세청에 등록된 정확한 정보를 입력해주세요.</p>
            </div>

            {isVerified && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <Check size={20} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={3} />
                <div>
                  <p className="text-emerald-800 font-bold m-0">사업자 등록 확인이 완료되었습니다.</p>
                  <p className="text-emerald-600/80 text-sm m-0 mt-1">인증된 정보는 수정할 수 없습니다.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">사업자등록번호 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="b_no" 
                  value={formData.b_no} 
                  onChange={handleInputChange} 
                  disabled={isVerified}
                  placeholder="'-' 없이 입력 (10자리)" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono disabled:opacity-50"
                  maxLength={10}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">개업일자 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="start_dt" 
                  value={formData.start_dt} 
                  onChange={handleInputChange} 
                  disabled={isVerified}
                  placeholder="YYYYMMDD (예: 20240101)" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono disabled:opacity-50"
                  maxLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">대표자성명 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="p_nm" 
                  value={formData.p_nm} 
                  onChange={handleInputChange} 
                  disabled={isVerified}
                  placeholder="대표자 이름" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">상호명 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="b_nm" 
                  value={formData.b_nm} 
                  onChange={handleInputChange} 
                  disabled={isVerified}
                  placeholder="등록된 상호명" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">공동대표자성명 <span className="text-slate-400 font-normal">(선택)</span></label>
                <input 
                  type="text" 
                  name="p_nm2" 
                  value={formData.p_nm2} 
                  onChange={handleInputChange} 
                  disabled={isVerified}
                  placeholder="공동대표자가 있는 경우" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">법인등록번호 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="corp_no" 
                  value={formData.corp_no} 
                  onChange={handleInputChange} 
                  disabled={isVerified}
                  placeholder="'-' 없이 입력 (13자리)" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono disabled:opacity-50"
                  maxLength={13}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-slate-700">사업장주소 <span className="text-slate-400 font-normal">(선택)</span></label>
                <input 
                  type="text" 
                  name="b_adr" 
                  value={formData.b_adr} 
                  onChange={handleInputChange} 
                  disabled={isVerified}
                  placeholder="사업자등록증에 기재된 주소" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {!isVerified && (
              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:bg-blue-400"
                >
                  {isVerifying ? (
                    <><Loader2 size={20} className="animate-spin" /> 인증 진행 중...</>
                  ) : (
                    <><Check size={20} /> 사업자 등록 확인하기</>
                  )}
                </button>
              </div>
            )}
            {isVerified && (
              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  다음 단계로 <ArrowLeft className="rotate-180" size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Account & File */}
          <div className={`space-y-8 ${step === 2 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}`}>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                {/* TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 텍스트 수정 */}
                {/* <FileText className="text-blue-600" size={20} /> 첨부파일 및 계정 정보 */}
                <FileText className="text-blue-600" size={20} /> 계정 정보 입력
              </h2>
              {/* <p className="text-sm text-slate-500">사업자등록증 사본과 사용할 계정 정보를 입력해주세요.</p> */}
              <p className="text-sm text-slate-500">사용할 계정 정보를 입력해주세요.</p>
            </div>

            <div className="space-y-6">
              {/* TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 주석 처리 */}
              {/*
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">사업자등록증 사본 업로드 <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer relative flex flex-col items-center justify-center gap-2">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${attachment ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Upload size={20} />
                  </div>
                  <div className="text-center">
                    {attachment ? (
                      <p className="text-sm font-bold text-blue-600 m-0">{attachment.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-slate-700 m-0">클릭하여 파일을 선택하세요</p>
                        <p className="text-xs text-slate-400 m-0 mt-1">지원 형식: PDF, JPG, PNG (최대 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">관리자 이메일 <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="로그인에 사용할 이메일" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">비밀번호 <span className="text-red-500">*</span></label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder="4자 이상 입력" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                이전 단계
              </button>
              <button 
                type="button"
                onClick={() => setStep(3)}
                // TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 주석 처리
                // disabled={!attachment || !formData.email || !formData.password}
                disabled={!formData.email || !formData.password}
                className="flex-[2] py-4 rounded-xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                정보 검토하기 <ArrowLeft className="rotate-180" size={20} />
              </button>
            </div>
          </div>

          {/* Step 3: Review & Submit */}
          <div className={`space-y-8 ${step === 3 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}`}>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <ListChecks className="text-blue-600" size={20} /> 입력 정보 최종 검토
              </h2>
              <p className="text-sm text-slate-500">신청 전 모든 정보가 올바르게 입력되었는지 확인해주세요.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-blue-600 border-b border-blue-100 pb-2 mb-3">사업자 등록 확인</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">사업자등록번호</span><strong className="font-mono text-slate-900">{formData.b_no}</strong></div>
                  <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">개업일자</span><strong className="text-slate-900">{formData.start_dt}</strong></div>
                  <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">대표자성명</span><strong className="text-slate-900">{formData.p_nm}{formData.p_nm2 && `, ${formData.p_nm2}`}</strong></div>
                  {formData.b_nm && <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">상호명</span><strong className="text-slate-900">{formData.b_nm}</strong></div>}
                  {formData.corp_no && <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">법인등록번호</span><strong className="font-mono text-slate-900">{formData.corp_no}</strong></div>}
                  {formData.b_adr && <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">사업장주소</span><strong className="text-slate-900 text-right max-w-[60%]">{formData.b_adr}</strong></div>}
                </div>
              </div>
              
              <div>
                {/* TODO: 사업자등록증 사본 업로드 기능 제외로 인한 임시 주석 처리 및 텍스트 수정 */}
                {/* <h3 className="text-sm font-bold text-blue-600 border-b border-blue-100 pb-2 mb-3 mt-6">첨부파일 및 계정 정보</h3> */}
                <h3 className="text-sm font-bold text-blue-600 border-b border-blue-100 pb-2 mb-3 mt-6">계정 정보</h3>
                <div className="space-y-3">
                  {/* <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">첨부파일</span><strong className="text-slate-900">{attachment?.name}</strong></div> */}
                  <div className="flex justify-between items-center text-sm md:text-base"><span className="text-slate-500 font-medium">관리자 이메일</span><strong className="text-slate-900">{formData.email}</strong></div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                수정하기
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] py-4 rounded-xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 size={20} className="animate-spin" /> 신청 처리 중...</>
                ) : (
                  '가입 신청 완료'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
