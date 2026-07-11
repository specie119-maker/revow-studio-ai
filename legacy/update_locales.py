import json

with open('/Users/devorah/connect/ReVowStudioAI/locales/ko.json', 'r', encoding='utf-8') as f:
    ko = json.load(f)

ko["home_upload_hint"] = "사진을 끌어다 놓거나 클릭해서 시작하세요."
ko["home_preview_hint"] = "AI Result Preview<br>Coming Soon"
ko["btn_create_with_this"] = "이 사진으로 만들기"
ko["btn_save_high_res"] = "고화질 저장하기 💎"
ko["btn_create_more"] = "더 많은 스타일 만들기"

with open('/Users/devorah/connect/ReVowStudioAI/locales/ko.json', 'w', encoding='utf-8') as f:
    json.dump(ko, f, ensure_ascii=False, indent=2)

with open('/Users/devorah/connect/ReVowStudioAI/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

en["home_upload_hint"] = "Drag and drop or click to start."
en["home_preview_hint"] = "AI Result Preview<br>Coming Soon"
en["btn_create_with_this"] = "Create with this photo"
en["btn_save_high_res"] = "Save High-Res 💎"
en["btn_create_more"] = "Create More Styles"

with open('/Users/devorah/connect/ReVowStudioAI/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

print("Locales updated")
