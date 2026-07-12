"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import Script from 'next/script';

const PLANS = [
  { id: 'pack_5', name: '5장 (체험용)', price: 1000, desc: '가볍게 체험해 보세요', popular: false },
  { id: 'pack_20', name: '20장 패키지', price: 3900, originalPrice: 5000, desc: '가장 많이 선택하는 패키지', popular: true },
  { id: 'pack_60', name: '60장 대용량', price: 9900, originalPrice: 20000, desc: '앨범 전체를 복원할 때', popular: false }
];

const PAY_METHODS = [
  { id: 'kakaopay', name: '카카오페이', icon: '🟡', pg: 'kakaopay' },
  { id: 'tosspay', name: '토스페이', icon: '🔵', pg: 'tosspay' },
  { id: 'paypal', name: '페이팔 (해외)', icon: '🌐', pg: 'paypal' }
];

declare global {
  interface Window {
    IMP: any;
  }
}

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [selectedMethod, setSelectedMethod] = useState('kakaopay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    if (typeof window !== 'undefined' && !window.IMP) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    const { IMP } = window;
    // 포트원 테스트 상점 아이디 (실제 서비스 시 본인 식별코드로 변경해야 함)
    IMP.init("imp00000000"); // 예시: 가맹점 식별코드

    const pgCode = PAY_METHODS.find(m => m.id === selectedMethod)?.pg || 'kakaopay';
    
    setIsProcessing(true);

    IMP.request_pay({
      pg: pgCode,
      pay_method: 'card', 
      merchant_uid: `mid_${new Date().getTime()}`, // 주문번호
      name: `ReVow - ${selectedPlan.name}`,
      amount: selectedPlan.price,
      buyer_email: "test@revow.kr",
      buyer_name: "ReVow 고객님",
      buyer_tel: "010-0000-0000",
      m_redirect_url: window.location.origin + "/checkout/success", // 모바일 환경을 위한 리다이렉트 URL
    }, (rsp: any) => {
      setIsProcessing(false);
      if (rsp.success) {
        setIsSuccess(true);
        // 포인트 충전 로직 (실제 서비스에서는 백엔드에서 처리)
        const current = parseInt(localStorage.getItem("revow_free_uses") || "0", 10);
        let addCredits = 1;
        if (selectedPlan.id === 'package') addCredits = 5;
        if (selectedPlan.id === 'monthly' || selectedPlan.id === 'yearly') addCredits = 999;
        localStorage.setItem("revow_free_uses", (current + addCredits).toString());
      } else {
        alert(`결제에 실패하였습니다. \n에러 내용: ${rsp.error_msg}`);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in text-center">
        <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-button animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4">결제가 완료되었습니다!</h1>
        <p className="text-foreground/70 mb-8 max-w-sm font-medium">
          성공적으로 프리미엄 서비스가 결제되었습니다. 이제 최고의 해상도로 소중한 추억을 선명하게 기록해 보세요.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-foreground text-background px-8 py-4 rounded-2xl font-bold hover:bg-foreground/80 transition-colors shadow-lg"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* 포트원 SDK 스크립트 추가 */}
      <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="lazyOnload" />

      {/* Header */}
      <header className="w-full h-16 border-b border-foreground/5 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-8">
        <button onClick={() => window.history.back()} className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 font-bold text-sm">
          <ArrowLeft size={18} /> 돌아가기
        </button>
        <div className="flex-1 text-center font-black text-lg tracking-tight">ReVow 프리미엄 결제</div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Options */}
          <div className="flex-1 space-y-10">
            {/* 1. Select Plan */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-primary" size={24} /> 이용권 선택
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLANS.map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative p-6 rounded-2xl text-left border-2 transition-all duration-300 overflow-hidden ${
                      selectedPlan.id === plan.id 
                        ? 'border-primary bg-primary/5 shadow-soft ring-4 ring-primary/10' 
                        : 'border-white bg-white hover:border-primary/30 shadow-sm'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm">
                        BEST 인기 패키지
                      </div>
                    )}
                    <h3 className={`text-lg font-black mb-1 ${selectedPlan.id === plan.id ? 'text-primary' : 'text-foreground'}`}>{plan.name}</h3>
                    <p className="text-xs text-foreground/50 font-medium mb-4 h-8 leading-relaxed">{plan.desc}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-foreground">{plan.price.toLocaleString()}원</span>
                      {plan.originalPrice && (
                        <span className="text-sm font-bold text-foreground/30 line-through mb-1">{plan.originalPrice.toLocaleString()}원</span>
                      )}
                    </div>
                    {selectedPlan.id === plan.id && (
                      <div className="absolute right-4 bottom-4 text-primary animate-pulse">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Select Payment Method */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="text-foreground/80" size={24} /> 포트원(PortOne) 결제 수단
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {PAY_METHODS.map(method => (
                  <button 
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                      selectedMethod === method.id
                        ? 'border-primary bg-white shadow-md transform -translate-y-1'
                        : 'border-transparent bg-white shadow-sm hover:shadow-md text-foreground/60'
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className={`text-[13px] font-bold ${selectedMethod === method.id ? 'text-foreground' : ''}`}>{method.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-background sticky top-24">
              <h2 className="text-xl font-black mb-6 border-b border-background pb-4">결제 요약</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm font-bold text-foreground/70">
                  <span>선택 상품</span>
                  <span className="text-foreground">{selectedPlan.name}</span>
                </div>
                {selectedPlan.originalPrice && (
                  <div className="flex justify-between items-center text-sm font-bold text-foreground/70">
                    <span>상품 원가</span>
                    <span className="line-through">{selectedPlan.originalPrice.toLocaleString()}원</span>
                  </div>
                )}
                {selectedPlan.originalPrice && (
                  <div className="flex justify-between items-center text-sm font-bold text-primary">
                    <span>패키지 할인</span>
                    <span>-{(selectedPlan.originalPrice - selectedPlan.price).toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-foreground/70 pt-4 border-t border-background border-dashed">
                  <span>결제 수단</span>
                  <span>{PAY_METHODS.find(m => m.id === selectedMethod)?.name}</span>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-5 mb-8 flex justify-between items-end">
                <span className="text-sm font-bold text-foreground/70 mb-1">최종 결제 금액</span>
                <span className="text-3xl font-black text-primary">{selectedPlan.price.toLocaleString()}원</span>
              </div>

              <div className="text-[11px] text-foreground/50 font-medium mb-6 bg-red-50 p-3 rounded-lg flex gap-2 items-start text-red-800">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>현재 <strong>포트원(PortOne) 테스트 환경</strong>으로 연동되어 있어 실제 금액이 청구되지 않습니다. (테스트 가맹점 식별코드 사용)</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-5 rounded-2xl bg-foreground text-background font-black text-lg shadow-button hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    결제 모듈 호출 중...
                  </>
                ) : (
                  `${selectedPlan.price.toLocaleString()}원 안전결제`
                )}
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
