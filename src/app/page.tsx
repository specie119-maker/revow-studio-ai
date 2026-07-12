"use client";
import Image from 'next/image';
import { useState, useRef, useEffect, useMemo } from 'react';
import { resizeImage } from '@/lib/imageUtils';
import { 
  Upload, Loader2, Download, RefreshCw, 
  Sparkles, Heart, Briefcase, GraduationCap, Home as HomeIcon, Camera, TreePine, Church, 
  Users, PawPrint, CalendarDays, Edit3, CheckSquare, Square, MessageCircleHeart, Crown,
  ArrowRight
} from 'lucide-react';
import { ReactCompareSlider } from 'react-compare-slider';
import Link from 'next/link';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';

const LOADING_MESSAGES = [
  "소중한 추억이 조금씩 선명해집니다...",
  "가장 아름다웠던 순간을 그리는 중입니다...",
  "당신의 기억 속 색을 찾는 중입니다...",
  "거의 다 완성되었어요. 잠시만 기다려주세요!"
];

const MOCK_PREVIEWS: Record<string, string> = {
  'hanbok-hanok': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
  'wedding-studio': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
  'suit-studio': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
  'gown-garden': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
  'default': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800'
};

const CORE_STORIES = [
  { id: 'wedding', label: '잃어버린 웨딩 사진', icon: Heart, desc: '다시 입어보는 드레스', color: 'bg-rose-50 border-rose-100 hover:border-rose-300' },
  { id: 'family', label: '빛바랜 가족 사진', icon: Users, desc: '우리의 따뜻한 날', color: 'bg-orange-50 border-orange-100 hover:border-orange-300' },
  { id: 'graduation', label: '잊지 못할 졸업식', icon: GraduationCap, desc: '찬란했던 그 시절', color: 'bg-blue-50 border-blue-100 hover:border-blue-300' },
  { id: 'pet', label: '그리운 반려동물', icon: PawPrint, desc: '영원한 나의 친구', color: 'bg-amber-50 border-amber-100 hover:border-amber-300' },
];

const TIME_AXIS_OPTIONS = [
  { id: 'past_to_present', label: '과거 ➞ 현재', desc: '예전 모습을 지금처럼 생생하게' },
  { id: 'present_to_future', label: '현재 ➞ 미래', desc: '미래의 빛나는 모습을 미리보기' },
];

const CLOTHING_OPTIONS = [
  { id: 'hanbok', label: '전통 한복', icon: Sparkles },
  { id: 'wedding', label: '서양식 웨딩', icon: Heart },
  { id: 'suit', label: '모던 수트', icon: Briefcase },
  { id: 'gown', label: '졸업 가운', icon: GraduationCap },
];

const BACKGROUND_OPTIONS = [
  { id: 'hanok', label: '전통 한옥', icon: HomeIcon },
  { id: 'studio', label: '실내 스튜디오', icon: Camera },
  { id: 'garden', label: '야외 정원', icon: TreePine },
  { id: 'church', label: '성당/교회', icon: Church },
];

const MOCK_COMMUNITY_STORIES = [
  {
    id: 1,
    author: '따뜻한딸',
    content: '50년 전 형편이 어려워 사진 한 장 못 남기신 부모님. 이번에 AI로 한복 입은 모습을 보여드렸더니 눈물을 글썽이셨어요. 정말 감사합니다.',
    beforeImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    afterImg: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
    likes: 124,
    isCuration: true
  },
  {
    id: 2,
    author: '강아지별',
    content: '먼저 무지개다리를 건넌 우리 뽀삐. 옛날 폰으로 찍어 흐릿했던 사진을 이렇게 생생하게 복원해주셔서 마음이 따뜻해졌습니다.',
    beforeImg: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
    afterImg: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400',
    likes: 89,
    isCuration: false
  }
];

export default function Home() {
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [selectedTimeAxis, setSelectedTimeAxis] = useState('past_to_present');
  const [selectedClothing, setSelectedClothing] = useState('wedding');
  const [selectedBackground, setSelectedBackground] = useState('studio');
  
  const [user, setUser] = useState<User | null>(null);
  const [userTokens, setUserTokens] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebaseUid: u.uid, email: u.email })
          });
          if (res.ok) {
            const data = await res.json();
            setUserTokens(data.user.tokens);
          }
        } catch (error) {
          console.error("Token sync failed:", error);
        }
      } else {
        setUserTokens(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);
  
  // Rate Limiting & BYOK State removed in favor of userTokens
  
  // Community State
  const [communityStories, setCommunityStories] = useState<any[]>(MOCK_COMMUNITY_STORIES);
  const [likedStories, setLikedStories] = useState<number[]>([]);
  const [heartParticles, setHeartParticles] = useState<{id: number, storyId: number}[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.success && data.stories.length > 0) {
        setCommunityStories(data.stories);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleStorySelect = (id: string) => {
    setActiveStory(id);
    setTimeout(() => {
      uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const currentMockPreview = useMemo(() => {
    const key = `${selectedClothing}-${selectedBackground}`;
    return MOCK_PREVIEWS[key] || MOCK_PREVIEWS[`${selectedClothing}-studio`] || MOCK_PREVIEWS['default'];
  }, [selectedClothing, selectedBackground]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setErrorMsg('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResultImage(null);
      setErrorMsg(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (userTokens <= 0) {
      alert("사용 가능한 토큰이 없습니다. 요금제 결제가 필요합니다.");
      return;
    }
    
    setIsGenerating(true);
    setErrorMsg(null);
    setLoadingMsgIdx(0);
    setResultImage(null);
    
    try {
      const resizedBase64 = await resizeImage(file, 1024);
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: resizedBase64,
          clothing: selectedClothing,
          background: selectedBackground,
          firebaseUid: user.uid
        })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || '생성 중 오류가 발생했습니다.');
      }
      
      setResultImage(data.imageBase64);
      if (data.remainingTokens !== undefined) {
        setUserTokens(data.remainingTokens);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLike = (storyId: number) => {
    if (likedStories.includes(storyId)) return;
    setLikedStories([...likedStories, storyId]);
    
    // Create particles
    const newParticles = Array.from({length: 3}).map((_, i) => ({
      id: Date.now() + i,
      storyId
    }));
    setHeartParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setHeartParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground items-center font-sans">
      {/* Write Story Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Edit3 size={20} className="text-primary"/> 사연 남기기
              </h2>
              
              {!file || !resultImage ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-center">
                  <p className="text-sm text-foreground/80 font-bold mb-1">먼저 사진을 복원해보세요!</p>
                  <p className="text-xs text-foreground/60">복원된 사진과 함께 사연을 남길 수 있습니다.</p>
                  <button onClick={() => setIsWriteModalOpen(false)} className="mt-3 bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg">돌아가기</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-4 h-24">
                    <div className="flex-1 relative rounded-xl overflow-hidden border border-background">
                       <Image src={previewUrl!} alt="Before" fill className="object-cover" />
                    </div>
                    <div className="flex-1 relative rounded-xl overflow-hidden border border-primary/20">
                       <Image src={resultImage} alt="After" fill className="object-cover" />
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-xs text-foreground/60 font-bold">템플릿으로 쉽게 작성해보세요!</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => {
                        const ta = document.getElementById('story-textarea') as HTMLTextAreaElement;
                        ta.value = "우리 엄마에게 [세상에서 가장 고운 한복]을 선물했어요.";
                      }} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20">우리 엄마에게 [  ] 선물했어요</button>
                      <button onClick={() => {
                        const ta = document.getElementById('story-textarea') as HTMLTextAreaElement;
                        ta.value = "사진 속 [아버지]의 모습에 오늘 눈물을 흘리셨어요.";
                      }} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20">사진 속 [  ] 모습에...</button>
                    </div>
                  </div>
                  <input type="text" id="story-title" placeholder="사연 제목 (예: 50년 전 잃어버린 웨딩 사진)" className="w-full bg-background border-2 border-background rounded-xl p-3 mb-2 text-sm focus:outline-none focus:border-primary/50 font-bold" />
                  <input type="text" id="story-author" placeholder="작성자 이름 (예: 따뜻한딸)" className="w-full bg-background border-2 border-background rounded-xl p-3 mb-2 text-sm focus:outline-none focus:border-primary/50" />
                  <textarea 
                    id="story-textarea"
                    className="w-full h-24 border-2 border-background rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 resize-none bg-background mb-4"
                    placeholder="따뜻한 사연을 들려주세요..."
                  ></textarea>
                  <label className="flex items-center gap-2 cursor-pointer mb-6 group">
                    <input type="checkbox" className="hidden peer" defaultChecked id="story-anon" />
                    <div className="w-5 h-5 rounded border-2 border-foreground/30 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center text-white transition-colors">
                      <CheckSquare size={14} className="opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-xs font-medium text-foreground/70 group-hover:text-foreground">얼굴을 약간 블러 처리하여 익명으로 올리기 (개인정보 보호)</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setIsWriteModalOpen(false)} disabled={isSubmitting} className="flex-1 py-3 bg-background text-foreground/70 font-bold rounded-xl text-sm hover:bg-gray-200">취소</button>
                    <button 
                      disabled={isSubmitting}
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                           // 1. Upload Before Image
                           const formDataBefore = new FormData();
                           formDataBefore.append('file', file);
                           const resB = await fetch('/api/upload', { method: 'POST', body: formDataBefore });
                           const dataB = await resB.json();

                           // 2. Upload After Image (base64)
                           const formDataAfter = new FormData();
                           formDataAfter.append('base64', resultImage);
                           const resA = await fetch('/api/upload', { method: 'POST', body: formDataAfter });
                           const dataA = await resA.json();

                           if(dataB.success && dataA.success) {
                             const titleVal = (document.getElementById('story-title') as HTMLInputElement).value;
                             const authorVal = (document.getElementById('story-author') as HTMLInputElement).value;
                             const contentVal = (document.getElementById('story-textarea') as HTMLTextAreaElement).value;

                             const resS = await fetch('/api/stories', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({
                                 title: titleVal || '나만의 따뜻한 기억',
                                 author: authorVal || '익명',
                                 content: contentVal,
                                 beforeImg: dataB.url,
                                 afterImg: dataA.url
                               })
                             });
                             
                             if(resS.ok) {
                               alert('사연이 등록되었습니다!');
                               setIsWriteModalOpen(false);
                               fetchStories();
                             } else {
                               alert('사연 등록에 실패했습니다.');
                             }
                           } else {
                             alert('이미지 업로드에 실패했습니다.');
                           }
                        } catch(e) {
                          alert('오류가 발생했습니다.');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }} 
                      className="flex-2 w-2/3 py-3 bg-primary text-white font-bold rounded-xl text-sm shadow-button hover:bg-primary-hover flex items-center justify-center disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : '기억 남기기'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white shadow-soft min-h-screen flex flex-col relative overflow-hidden pb-12">
        <header className="w-full py-4 px-6 flex justify-between items-center border-b border-background sticky top-0 bg-white/90 backdrop-blur-md z-30">
          <div className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1">
            ReVow <span className="text-primary font-black">AI</span>
          </div>
          <div className="flex gap-2">
            <Link href="/checkout" className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center gap-1">
              요금제
            </Link>
            {user && (
              <div className="text-xs px-3 py-1.5 rounded-full bg-primary text-white font-bold flex items-center gap-1 shadow-sm">
                토큰: {userTokens}장
              </div>
            )}
            {user ? (
              <button 
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-full bg-background font-medium hover:bg-primary hover:text-white transition-colors flex items-center gap-1 truncate max-w-[100px]"
              >
                {user.displayName?.split(' ')[0] || '사용자'}님 (로그아웃)
              </button>
            ) : (
              <button 
                onClick={handleGoogleLogin}
                className="text-xs px-3 py-1.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-sm"
              >
                로그인
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 w-full px-6 py-8 flex flex-col items-center">
          
          <section className="w-full flex flex-col items-center text-center space-y-3 mb-8">
            <h1 className="text-2xl font-black leading-tight text-foreground tracking-tight whitespace-pre-line">
              <span className="sr-only">사진 복원, AI사진보정으로 부모님선물 디지털 효도하기 - </span>
              {`함께한 시간은 충분하지만,\n정작 그날의 사진이 없으신가요?`}
            </h1>
            <h2 className="text-[13px] text-foreground/60 font-medium leading-relaxed px-4">
              빛바랜 사진 복구부터 추억 재현까지,<br/>AI가 당신만의 따뜻한 기억으로 다시 그려드립니다.
            </h2>
          </section>



          {/* Core Story Cards (Main Interaction) */}
          <section className="w-full mb-10">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {CORE_STORIES.map(story => {
                const isActive = activeStory === story.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => handleStorySelect(story.id)}
                    className={`relative p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-300 border-2 overflow-hidden ${
                      isActive 
                        ? 'border-primary bg-primary shadow-[0_8px_24px_rgba(255,127,80,0.3)] transform -translate-y-1' 
                        : `${story.color} hover:-translate-y-1`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isActive ? 'bg-white text-primary' : 'bg-white shadow-sm text-foreground/50'}`}>
                      <story.icon size={24} />
                    </div>
                    <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-white' : 'text-foreground'}`}>{story.label}</h3>
                    <p className={`text-[11px] ${isActive ? 'text-white/90' : 'text-foreground/50'}`}>{story.desc}</p>
                    
                    {isActive && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Detailed Setup & Upload Section (Shows when story selected) */}
          <section 
            ref={uploadSectionRef}
            className={`w-full flex flex-col gap-8 transition-all duration-700 overflow-hidden relative ${
              activeStory ? 'opacity-100 max-h-[2000px] mb-12' : 'opacity-0 max-h-0'
            }`}
          >
            <div className="flex justify-between items-center w-full">
               <h2 className="text-lg font-black text-primary">나만의 기억 커스텀</h2>
               <button 
                 onClick={() => {
                   setActiveStory(null);
                   setFile(null);
                   setResultImage(null);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }} 
                 className="text-[11px] font-bold bg-background text-foreground/60 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
               >
                 ✖ 나가기
               </button>
            </div>
            <div className="w-full h-px bg-background -mt-4"></div>
            
            {/* Time Axis Setting */}
            <div className="w-full space-y-3">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                <CalendarDays size={18} className="text-primary"/> 1. 시간축 설정
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {TIME_AXIS_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedTimeAxis(opt.id)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 text-[13px] font-semibold transition-all border-2 ${
                      selectedTimeAxis === opt.id
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-background bg-white text-foreground/70 hover:border-primary/30'
                    }`}
                  >
                    {opt.label}
                    <span className={`text-[10px] font-normal ${selectedTimeAxis === opt.id ? 'text-primary/80' : 'text-foreground/50'}`}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Options (Clothing & BG) */}
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h2 className="text-[14px] font-bold text-foreground">2. 의상 설정</h2>
                <div className="flex flex-col gap-2">
                  {CLOTHING_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedClothing(opt.id)}
                      className={`py-2 px-3 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all border ${
                        selectedClothing === opt.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-background bg-white text-foreground/70'
                      }`}
                    >
                      <opt.icon size={14} className={selectedClothing === opt.id ? "text-primary" : "text-foreground/40"} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-[14px] font-bold text-foreground">3. 배경 설정</h2>
                <div className="flex flex-col gap-2">
                  {BACKGROUND_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedBackground(opt.id)}
                      className={`py-2 px-3 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all border ${
                        selectedBackground === opt.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-background bg-white text-foreground/70'
                      }`}
                    >
                      <opt.icon size={14} className={selectedBackground === opt.id ? "text-primary" : "text-foreground/40"} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload Area & Slider */}
            <div className="w-full space-y-3">
               <h2 className="text-[15px] font-bold text-foreground">4. 사진 업로드 및 생성</h2>
               <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-background border-4 border-white group animate-fade-in">
                <ReactCompareSlider
                  itemOne={
                    <div className="w-full h-full relative cursor-pointer" onClick={() => !file && fileInputRef.current?.click()}>
                      <Image 
                        src={file && previewUrl ? previewUrl : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"}
                        alt="Before Upload"
                        fill
                        className={`object-cover ${!file ? 'grayscale opacity-70' : ''}`}
                      />
                      {!file && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                          <div className="w-10 h-10 bg-white/90 rounded-full shadow-sm flex items-center justify-center text-primary mb-2">
                            <Upload size={20} />
                          </div>
                          <span className="text-white font-bold text-xs shadow-sm">클릭하여 원본 업로드</span>
                        </div>
                      )}
                      {!file ? (
                        <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-white/90 shadow-sm pointer-events-none">
                          Before
                        </span>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-white/90 shadow-sm hover:bg-black/70 z-30 flex items-center gap-1 transition-colors"
                        >
                          <Camera size={12} /> 다른 사진으로 변경
                        </button>
                      )}
                    </div>
                  }
                  itemTwo={
                    <div className="w-full h-full relative">
                      <Image 
                        src={resultImage || currentMockPreview}
                        alt="AI Restored Moment"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-300/40 via-transparent to-transparent pointer-events-none mix-blend-screen"></div>
                      <span className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-white shadow-sm pointer-events-none">
                        {resultImage ? 'After ✨' : '미리보기 👀'}
                      </span>
                    </div>
                  }
                  handle={
                    <div className="flex flex-col items-center justify-center h-full cursor-grab active:cursor-grabbing w-8 group-hover:opacity-100 transition-opacity">
                      <div className="w-[3px] h-full bg-white shadow-md"></div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-primary/20 flex items-center justify-center text-primary z-10 animate-[bounce-x_1.5s_ease-in-out_2]">
                        <span className="text-[10px] font-bold tracking-tighter">↔</span>
                      </div>
                    </div>
                  }
                  className="w-full h-full"
                />
                {resultImage && (
                  <div className="absolute bottom-4 right-4 flex gap-2 z-20 pointer-events-auto">
                    <a href={resultImage} download="revow-memory.jpg" className="bg-white/90 text-foreground p-3 rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                      <Download size={20} />
                    </a>
                  </div>
                )}
              </div>
              {errorMsg && (
                <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              {file && !isGenerating && (
                <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3 flex justify-between items-center animate-fade-in">
                  <span className="text-[13px] font-bold text-primary">업로드한 사진을 변경하시겠습니까?</span>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-white text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    사진 다시 업로드
                  </button>
                </div>
              )}
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="relative w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-button hover:bg-primary-hover transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> 
                    <span className="text-sm font-medium">{LOADING_MESSAGES[loadingMsgIdx]}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={20} />
                    {resultImage ? '현재 사진으로 새로운 조합 만들기' : (file ? '선택한 옵션으로 복원 시작' : '소중한 순간 복원하기')}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* Community Section (Digital Filial Piety) */}
          <section className="w-full mt-12 bg-background/50 rounded-3xl p-6 border-2 border-background relative overflow-hidden">
              <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-black text-foreground mb-1">디지털 효도:<br/><span className="text-primary">우리의 따뜻한 이야기</span></h2>
                <p className="text-xs text-foreground/60 font-medium">기억을 기록하고 기적을 나눕니다.</p>
              </div>
              <button 
                onClick={() => setIsWriteModalOpen(true)}
                className="text-xs bg-white border border-primary/20 text-primary px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-shadow font-bold flex items-center gap-1"
              >
                <Edit3 size={14} /> 사연 쓰기
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {communityStories.map(story => {
                const isLiked = likedStories.includes(story.id);
                const storyParticles = heartParticles.filter(p => p.storyId === story.id);
                
                return (
                  <div key={story.id} className="bg-white rounded-2xl p-4 shadow-sm border border-background">
                    {story.isCuration && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-primary mb-3 bg-primary/10 w-max px-2 py-1 rounded-full">
                        <Crown size={12} /> 이번 주의 따뜻한 기억
                      </div>
                    )}
                    
                    {/* Before/After Display for Community Card */}
                    <div className="flex gap-2 mb-4 h-32 cursor-pointer" onClick={() => window.location.href = `/story/${story.id}`}>
                      <div className="flex-1 relative rounded-xl overflow-hidden grayscale opacity-80 border-2 border-background">
                        <Image src={story.beforeImg} alt={`복원 전 - ${story.title || '사연 이미지'}`} fill className="object-cover" />
                        <span className="absolute top-2 left-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm">Before</span>
                      </div>
                      <div className="flex items-center justify-center text-foreground/30"><ArrowRight size={16}/></div>
                      <div className="flex-1 relative rounded-xl overflow-hidden border-2 border-primary/20">
                        <Image src={story.afterImg} alt={`복원 후 - ${story.title || '사연 이미지'}`} fill className="object-cover" />
                        <span className="absolute top-2 right-2 bg-primary/90 text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm">After ✨</span>
                      </div>
                    </div>
                    
                    <a href={`/story/${story.id}`} className="block group">
                      <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{story.title}</h3>
                      <p className="text-sm leading-relaxed text-foreground/90 font-medium mb-4 whitespace-pre-wrap line-clamp-3">
                        "{story.content}"
                      </p>
                    </a>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-background">
                      <span className="text-xs font-bold text-foreground/50">{story.author}</span>
                      
                      {/* Interaction Button */}
                      <div className="relative">
                        <button 
                          onClick={() => handleLike(story.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                            isLiked ? 'bg-primary/10 text-primary' : 'bg-background text-foreground/50 hover:bg-primary/5 hover:text-primary/70'
                          }`}
                        >
                          <MessageCircleHeart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
                          따뜻해요 {story.likes + (isLiked ? 1 : 0)}
                        </button>
                        
                        {/* Particles */}
                        {storyParticles.map(p => (
                          <div 
                            key={p.id} 
                            className="absolute top-0 left-1/2 -translate-x-1/2 text-primary animate-float-up pointer-events-none"
                            style={{ 
                              marginLeft: `${Math.random() * 20 - 10}px`,
                              animationDelay: `${Math.random() * 0.2}s`
                            }}
                          >
                            <Heart size={14} className="fill-primary" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <button className="w-full mt-4 py-3 bg-white border border-background rounded-xl text-xs font-bold text-foreground/50 hover:bg-background transition-colors">
              더 많은 따뜻한 이야기 보기
            </button>
          </section>

          {/* ReVow Demo Video Section (Full Width Bottom) */}
          <section className="w-full mt-12 overflow-hidden border-t-2 border-background">
            <video 
              src="/asserts/ReVow.mp4" 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-auto block object-cover"
            />
          </section>

        </main>
      </div>
    </div>
  );
}
