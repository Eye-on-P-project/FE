import { useEffect, useState } from 'react';
import { Building2, ArrowLeft, Check, Sparkles, Zap, Loader2, CreditCard, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { getCurrentSubscription, changeSubscription } from './api/subscription';
import type { SubscriptionPlan } from './types/subscription';

export default function SubscriptionApp() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('FREE');
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getCurrentSubscription();
        setCurrentPlan(data.plan);
      } catch (error) {
        toast.error('구독 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    
    setProcessingPlan(plan);
    try {
      // Mock paymentInfo
      const paymentMethodId = 'mock_card_1234';
      const response = await changeSubscription({ plan, paymentMethodId });
      
      if (response.success) {
        setCurrentPlan(response.newPlan);
        setSelectedPlanForPayment(null);
        toast.success(response.message);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      toast.error('결제 및 플랜 변경 중 오류가 발생했습니다.');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center py-12 px-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-5xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight m-0">요금제 안내 및 구독 관리</h1>
            <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">Subscription Management</span>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={18} /> 메인으로 돌아가기
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
          <p className="font-bold">구독 정보를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FREE Plan */}
          <div className={`relative flex flex-col bg-white rounded-3xl border ${currentPlan === 'FREE' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200'} shadow-xl overflow-hidden p-8 transition-transform hover:-translate-y-1`}>
            {currentPlan === 'FREE' && (
              <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-xs font-black text-center py-1.5 uppercase tracking-widest">
                현재 사용 중인 플랜
              </div>
            )}
            <div className={`mb-6 ${currentPlan === 'FREE' ? 'mt-4' : ''}`}>
              <h3 className="text-xl font-black text-slate-900 mb-2">Free</h3>
              <p className="text-sm text-slate-500">기본적인 모니터링이 필요한 소규모 조직에 적합합니다.</p>
            </div>
            <div className="mb-8">
              <strong className="text-4xl font-black text-slate-900">₩0</strong>
              <span className="text-slate-500 font-medium"> / 월</span>
            </div>
            <div className="space-y-4 flex-1 mb-8">
              <div className="flex items-start gap-3">
                <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700"><strong>최대 5명</strong> 관리</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">데이터 열람 <strong>7일</strong> 제한</span>
              </div>
            </div>
            <button 
              disabled={currentPlan === 'FREE' || processingPlan !== null}
              onClick={() => setSelectedPlanForPayment('FREE')}
              className={`w-full py-3.5 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 ${currentPlan === 'FREE' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
            >
              {processingPlan === 'FREE' ? <Loader2 size={18} className="animate-spin" /> : currentPlan === 'FREE' ? '현재 사용 중' : 'Free 플랜으로 변경'}
            </button>
          </div>

          {/* PLUS Plan */}
          <div className={`relative flex flex-col bg-white rounded-3xl border ${currentPlan === 'PLUS' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200'} shadow-xl overflow-hidden p-8 transition-transform hover:-translate-y-1`}>
            {currentPlan === 'PLUS' && (
              <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-xs font-black text-center py-1.5 uppercase tracking-widest">
                현재 사용 중인 플랜
              </div>
            )}
            <div className={`mb-6 ${currentPlan === 'PLUS' ? 'mt-4' : ''}`}>
              <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                Plus <Sparkles size={18} className="text-blue-500" />
              </h3>
              <p className="text-sm text-slate-500">본격적인 관리가 필요한 중소규모 조직에 추천합니다.</p>
            </div>
            <div className="mb-8">
              <strong className="text-4xl font-black text-slate-900">₩15,000</strong>
              <span className="text-slate-500 font-medium"> / 월</span>
            </div>
            <div className="space-y-4 flex-1 mb-8">
              <div className="flex items-start gap-3">
                <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700"><strong>최대 50명</strong> 관리</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">데이터 열람 <strong>1달</strong> 제한</span>
              </div>
            </div>
            <button 
              disabled={currentPlan === 'PLUS' || processingPlan !== null}
              onClick={() => setSelectedPlanForPayment('PLUS')}
              className={`w-full py-3.5 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 ${currentPlan === 'PLUS' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'}`}
            >
              {processingPlan === 'PLUS' ? <Loader2 size={18} className="animate-spin" /> : currentPlan === 'PLUS' ? '현재 사용 중' : 'Plus 플랜 선택'}
            </button>
          </div>

          {/* PRO Plan */}
          <div className={`relative flex flex-col bg-slate-900 rounded-3xl border ${currentPlan === 'PRO' ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-slate-800'} shadow-2xl overflow-hidden p-8 transition-transform hover:-translate-y-1`}>
            {currentPlan === 'PRO' && (
              <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-xs font-black text-center py-1.5 uppercase tracking-widest">
                현재 사용 중인 플랜
              </div>
            )}
            <div className={`mb-6 ${currentPlan === 'PRO' ? 'mt-4' : ''}`}>
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                Pro <Zap size={18} className="text-amber-400 fill-amber-400" />
              </h3>
              <p className="text-sm text-slate-400">대규모 인원 관리가 필요한 엔터프라이즈 환경에 적합합니다.</p>
            </div>
            <div className="mb-8">
              <strong className="text-4xl font-black text-white">₩49,000</strong>
              <span className="text-slate-400 font-medium"> / 월</span>
            </div>
            <div className="space-y-4 flex-1 mb-8">
              <div className="flex items-start gap-3">
                <Check size={18} className="text-purple-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300"><strong>최대 200명</strong> 관리</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={18} className="text-purple-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">데이터 <strong>영구(무제한)</strong> 보관</span>
              </div>
            </div>
            <button 
              disabled={currentPlan === 'PRO' || processingPlan !== null}
              onClick={() => setSelectedPlanForPayment('PRO')}
              className={`w-full py-3.5 rounded-xl font-black transition-all flex justify-center items-center gap-2 ${currentPlan === 'PRO' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/25'}`}
            >
              {processingPlan === 'PRO' ? <Loader2 size={18} className="animate-spin" /> : currentPlan === 'PRO' ? '현재 사용 중' : 'Pro 플랜 시작하기'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">결제 진행</h2>
              <button 
                onClick={() => setSelectedPlanForPayment(null)}
                disabled={processingPlan !== null}
                className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-500">선택한 플랜</span>
                  <span className={`px-2 py-1 rounded text-xs font-black uppercase ${
                    selectedPlanForPayment === 'PRO' ? 'bg-purple-100 text-purple-700' :
                    selectedPlanForPayment === 'PLUS' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedPlanForPayment}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-slate-500">월 결제 금액</span>
                  <span className="text-2xl font-black text-slate-900">
                    {selectedPlanForPayment === 'PRO' ? '₩49,000' : selectedPlanForPayment === 'PLUS' ? '₩15,000' : '₩0'}
                  </span>
                </div>
              </div>

              {selectedPlanForPayment !== 'FREE' && (
                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-2">결제 수단 (Mock)</label>
                  <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white">
                    <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center">
                      <CreditCard size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-700">국민카드 (법인)</div>
                      <div className="text-xs text-slate-500">**** **** **** 1234</div>
                    </div>
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      기본 결제수단
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <Check size={12} /> 실제 서버 연동 시 PG 결제창이 호출됩니다.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPlanForPayment(null)}
                  disabled={processingPlan !== null}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={() => handleSubscribe(selectedPlanForPayment)}
                  disabled={processingPlan !== null}
                  className="flex-1 py-3 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-blue-600/20"
                >
                  {processingPlan !== null ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    '결제 진행하기'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
