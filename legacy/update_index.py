import re

with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Header
html = html.replace(
    '<header class="app-header">',
    '<header class="app-header" style="position: relative;">'
)
html = html.replace(
    '<div class="logo">ReVow Studio AI</div>',
    '<div class="logo" data-i18n="brand">ReVow Studio AI</div>\n      <button onclick="app.toggleLanguage()" class="lang-toggle-btn" style="position: absolute; right: 20px; top: 16px; background: none; border: 1px solid var(--color-gold); border-radius: 8px; padding: 4px 8px; font-size: 12px; color: var(--color-gold); cursor: pointer;">🌐 <span id="lang-indicator">KO</span> / EN</button>'
)

# 2. Update Home View
html = html.replace('<h1 class="hero-title">Love, Once Again.</h1>', '<h1 class="hero-title" data-i18n="home_main">Love, Once Again.</h1>')
html = html.replace('<p class="hero-subtitle">AI Wedding & Memory Portrait Studio</p>', '<p class="hero-subtitle" data-i18n="home_subtitle">AI Wedding & Memory Portrait Studio</p>')
html = html.replace('<p class="hero-desc">기다려온 순간을 AI가 사진으로 완성합니다.</p>', '<p class="hero-desc" data-i18n="home_message">기다려온 순간을<br>AI가 사진으로 완성합니다.</p>')
html = html.replace('<button class="btn btn-primary" onclick="app.navigate(\'upload\')">Create Our Moment Photo</button>', '<button class="btn btn-primary" onclick="app.navigate(\'upload\')" data-i18n="btn_create_moment">나만의 순간 만들기</button>')
html = html.replace('<button class="btn btn-secondary" onclick="app.navigate(\'upload\')">Restore Memories</button>', '<button class="btn btn-secondary hide" onclick="app.navigate(\'upload\')">Restore Memories</button>')

# 3. Update Upload View
html = re.sub(r'<h2>Create Your Memory Profile</h2>', '<h2 data-i18n="upload_title">소중한 사진을 올려주세요.</h2>', html)
html = re.sub(r'<p>Upload a few photos so AI can keep your unique features\.<br>\(1 photo minimum, 3-5 recommended\)</p>', '<p data-i18n="upload_desc">더 자연스러운 결과를 위해<br>여러 장의 사진을 추가할 수 있습니다.</p>', html)

html = re.sub(r'<span class="slot-label">Main Photo</span>', '<span class="slot-label" data-i18n="upload_main">대표 사진 (필수)</span>', html)
html = re.sub(r'<span class="slot-label">Additional Photos \(3-5 recommended\)</span>', '<span class="slot-label" data-i18n="upload_additional">추가 사진 (선택)</span>', html)

html = html.replace('I confirm I have permission to use these photos.', '<span data-i18n="upload_consent">이 사진들의 사용 권한이 있음을 확인합니다.</span>')
html = html.replace('<button class="btn btn-primary full-width" id="btn-create-profile" disabled onclick="app.createMemoryProfile()">Create Memory Profile</button>', '<button class="btn btn-primary full-width" id="btn-create-profile" disabled onclick="app.createMemoryProfile()" data-i18n="btn_create_profile">추억 프로필 만들기</button>')

# Hide privacy notice for MVP
html = html.replace('<div class="privacy-notice">', '<div class="privacy-notice hide">')

# 4. Creating Profile View
html = html.replace('<h2>Creating your Memory Profile...</h2>', '<h2 data-i18n="profile_creating">AI가 당신의 모습을 기억하는 중입니다.</h2>')
html = html.replace('<p>Learning your unique facial features.</p>', '<p data-i18n="profile_creating_desc">잠시만 기다려주세요.</p>')

# 5. Profile Ready View
html = html.replace('<h2>Memory Profile Ready</h2>', '<h2 data-i18n="profile_ready">프로필 생성 완료</h2>')
html = html.replace('<p style="margin-bottom: 30px;">We\'ve memorized your features. You can now use this profile to create multiple moments.</p>', '<p style="margin-bottom: 30px;" data-i18n="profile_ready_desc">이제 다양한 순간을 만들 수 있습니다.</p>')
html = html.replace('<button class="btn btn-primary full-width" onclick="app.navigate(\'style\')">Choose Time Moment & Style</button>', '<button class="btn btn-primary full-width" onclick="app.navigate(\'style\')" data-i18n="btn_choose_style">시간 및 스타일 선택</button>')

# 6. Style Select View (Target Age)
html = html.replace('<h2>Choose your portrait style</h2>', '<h2 data-i18n="time_title">어느 순간의 모습을 만들까요?</h2>')
html = html.replace('<p>Select the age and outfit for your AI moment photo.</p>', '') # Remove subtitle

html = html.replace('<h3>Target Age</h3>', '') # Hide
html = html.replace('<div class="option-group-header" style="margin-top: 0;">', '<div class="option-group-header hide" style="margin-top: 0;">')

html = re.sub(r'<h3>20s</h3>\s*<p>Young and radiant moment</p>', '<h3 data-i18n="time_20s">20대의 나</h3>', html)
html = re.sub(r'<h3>30s</h3>\s*<p>Elegant and beautiful moment</p>', '<h3 data-i18n="time_30s">30대의 나</h3>', html)
html = re.sub(r'<h3>Current Look</h3>\s*<p>Beautiful as you are today</p>', '<h3 data-i18n="time_current">지금 모습 그대로</h3>', html)

# Outfit & Theme
html = html.replace('<h3>Outfit & Theme</h3>', '<h3 data-i18n="style_title">어떤 스타일로 완성할까요?</h3>')

html = re.sub(r'<h3>Classic Wedding</h3>\s*<p>Western wedding dress and tuxedo</p>', '<h3 data-i18n="style_wedding">웨딩 포트레이트</h3>', html)
html = re.sub(r'<h3>Korean Hanbok Wedding</h3>\s*<p>Traditional Korean wedding hanbok</p>', '<h3 data-i18n="style_traditional">한복 / 전통 의상</h3>', html)
html = re.sub(r'<h3>Modern Minimal</h3>\s*<p>Elegant suit, dress, clean studio</p>', '<h3 data-i18n="style_modern">모던 스튜디오</h3>', html)

# Remove other styles
styles_to_remove = [
    r'<!-- 4\. Japanese Wedding -->.*?</div>',
    r'<!-- 5\. Chinese Wedding -->.*?</div>',
    r'<!-- 6\. Indian Wedding -->.*?</div>',
    r'<!-- 7\. Muslim Wedding -->.*?</div>',
    r'<!-- 8\. Custom Culture -->.*?</div>'
]
for pattern in styles_to_remove:
    html = re.sub(pattern, '', html, flags=re.DOTALL)

# Hide custom input
html = html.replace('<div id="custom-culture-input" class="custom-input-container hide">', '<div id="custom-culture-input" class="custom-input-container hide" style="display:none !important;">')

# Convert Upload Outfit Reference into a card instead of the big block, to match the UI style
# Or just replace the big block title
html = html.replace('<h3>Have a specific outfit in mind?</h3>', '<h3 data-i18n="style_custom">내 의상 이미지 올리기</h3>')
html = html.replace('<p>Upload an outfit reference image.<br>AI will use this as style inspiration for your moment photo.</p>', '')
html = html.replace('<span>Upload My Outfit Reference</span>', '<span data-i18n="style_custom">내 의상 이미지 올리기</span>')
html = html.replace('<div class="divider">\n          <span>OR</span>\n        </div>', '')

# 7. Generating View
html = html.replace('<h2>Creating your precious moment...</h2>', '<h2 data-i18n="generating_title">소중한 순간을 만들고 있습니다...</h2>')
html = html.replace('<p>Your memory is becoming a new story.</p>', '<p data-i18n="generating_desc">당신의 이야기가<br>새로운 사진이 되고 있습니다.</p>')

# 8. Result View
html = html.replace('<h2>Your Moment Photo is Ready</h2>', '<h2 data-i18n="result_title">당신의 순간이 완성되었습니다.</h2>')
html = html.replace('<button class="btn btn-primary" onclick="app.saveImage()">Save Memory</button>', '<button class="btn btn-primary" onclick="app.saveImage()" data-i18n="btn_save">저장하기</button>')
html = html.replace('<button class="btn btn-outline" onclick="app.shareImage()">Share with Family</button>', '<button class="btn btn-outline" onclick="app.shareImage()" data-i18n="btn_share">가족과 공유하기</button>')
html = html.replace('<button class="btn btn-text" onclick="app.navigate(\'upload\')">Create Another Photo</button>', '<button class="btn btn-text" onclick="app.navigate(\'upload\')" data-i18n="btn_recreate">다시 만들기</button>')


with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html")
