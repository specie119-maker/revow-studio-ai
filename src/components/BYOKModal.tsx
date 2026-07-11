"use client";
import { useState, useEffect } from "react";
import { Key, X } from "lucide-react";

interface BYOKModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export default function BYOKModal({ isOpen, onClose, onSave }: BYOKModalProps) {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("revow_gemini_key");
      if (stored) setApiKey(stored);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("revow_gemini_key", apiKey);
    onSave(apiKey);
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem("revow_gemini_key");
    setApiKey("");
    onSave("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative border border-background">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">
          <X size={20} />
        </button>
        
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Key size={24} />
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">본인의 API 키 입력 (BYOK)</h2>
          <p className="text-sm text-foreground/70 mb-6 leading-relaxed">
            무료 이용 횟수(2회)를 모두 소진하셨거나 무제한으로 이용하고 싶으시다면, 본인의 Google Gemini API 키를 입력해 주세요. (키는 브라우저에만 안전하게 저장됩니다.)
          </p>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-xl border-2 border-background bg-background text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="flex-1 py-3 rounded-xl border-2 border-background text-foreground/70 font-bold text-sm hover:bg-background transition-colors"
            >
              초기화
            </button>
            <button
              onClick={handleSave}
              className="flex-2 w-2/3 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-button hover:bg-primary-hover transition-colors"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
