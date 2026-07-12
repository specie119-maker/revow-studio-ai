"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PLANS = [
  { id: 'pack_5', name: '5장 (체험용)', price: 1000, desc: '가볍게 체험해 보세요', popular: false },
  { id: 'pack_20', name: '20장 패키지', price: 3900, originalPrice: 5000, desc: '가장 많이 선택하는 패키지', popular: true },
  { id: 'pack_60', name: '60장 대용량', price: 9900, originalPrice: 20000, desc: '앨범 전체를 복원할 때', popular: false }
];

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handlePayPalSuccess = async (details: any) => {
    setIsProcessing(true);
    if (!user) {
      alert("결제가 완료되었으나, 로그인이 되어 있지 않아 토큰을 지급할 수 없습니다. 고객센터에 문의해주세요.");
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/checkout/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid, planId: selectedPlan.id, orderId: details.id })
      });
      
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert("서버에 결제 내역을 기록하는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      alert("결제 처리 중 네트워크 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
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
        <Link 
          href="/" 
          className="px-8 py-4 rounded-xl bg-foreground text-background font-black text-lg shadow-soft hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
        >
          서비스 이용하기
        </Link>
      </div>
    );
  }

  // Convert KRW to approximate USD for PayPal (e.g. 1 USD = 1300 KRW)
  const usdAmount = (selectedPlan.price / 1300).toFixed(2);

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
      <div className="min-h-screen bg-background/50 font-sans">
        
        {/* Header */}
        <header className="w-full py-4 px-6 flex justify-between items-center border-b border-background bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <Link href="/" className="flex items-center justify-center p-2 rounded-full hover:bg-background transition-colors">
            <ArrowLeft size={24} className="text-foreground" />
          </Link>
          <div className="flex-1 text-center font-black text-lg tracking-tight">ReVow 프리미엄 결제</div>
          <div className="w-10"></div> {/* Spacer for centering */}
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
                </div>

                <div className="bg-background rounded-2xl p-5 mb-8 flex justify-between items-end">
                  <span className="text-sm font-bold text-foreground/70 mb-1">최종 결제 금액</span>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-primary">{selectedPlan.price.toLocaleString()}원</span>
                    <span className="text-sm font-bold text-foreground/50">약 ${usdAmount} USD</span>
                  </div>
                </div>

                <div className="text-[11px] text-foreground/50 font-medium mb-6 bg-blue-50 p-3 rounded-lg flex gap-2 items-start text-blue-800">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>안전하고 빠른 글로벌 결제 서비스인 <strong>PayPal</strong>을 통해 결제가 진행됩니다.</span>
                </div>

                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 py-4 mb-4 text-primary font-bold">
                    <Loader2 className="animate-spin" size={20} /> 결제 처리 중...
                  </div>
                )}
                
                <PayPalButtons
                  style={{ layout: "vertical", shape: "rect", color: "blue" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            currency_code: "USD",
                            value: usdAmount,
                          },
                          description: `ReVow - ${selectedPlan.name}`,
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      const details = await actions.order.capture();
                      await handlePayPalSuccess(details);
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    alert("결제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                  }}
                />
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
