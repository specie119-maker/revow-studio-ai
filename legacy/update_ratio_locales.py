import json

with open('/Users/devorah/connect/ReVowStudioAI/locales/ko.json', 'r', encoding='utf-8') as f:
    ko = json.load(f)

ko["ratio_title"] = "어떤 비율로 출력할까요?"
ko["ratio_portrait"] = "세로 (9:16)"
ko["ratio_portrait_desc"] = "모바일, 릴스, 쇼츠에 최적"
ko["ratio_square"] = "정방형 (1:1)"
ko["ratio_square_desc"] = "프로필, SNS 피드에 최적"
ko["ratio_landscape"] = "가로 (16:9)"
ko["ratio_landscape_desc"] = "웹사이트, PC, TV 표출용"
ko["ratio_print"] = "사진 인화용 (4:5)"
ko["ratio_print_desc"] = "액자, 실물 앨범 제작용"

with open('/Users/devorah/connect/ReVowStudioAI/locales/ko.json', 'w', encoding='utf-8') as f:
    json.dump(ko, f, ensure_ascii=False, indent=2)

with open('/Users/devorah/connect/ReVowStudioAI/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

en["ratio_title"] = "Choose Output Format"
en["ratio_portrait"] = "Portrait (9:16)"
en["ratio_portrait_desc"] = "Best for mobile, Reels, Shorts"
en["ratio_square"] = "Square (1:1)"
en["ratio_square_desc"] = "Best for profile, SNS post"
en["ratio_landscape"] = "Landscape (16:9)"
en["ratio_landscape_desc"] = "Best for website, PC, TV display"
en["ratio_print"] = "Print Portrait (4:5)"
en["ratio_print_desc"] = "Best for photo frame and album"

with open('/Users/devorah/connect/ReVowStudioAI/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

print("Locales updated with ratio options")
