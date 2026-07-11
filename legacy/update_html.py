import re

with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Home View demo section
home_demo_replacement = """        <div class="before-after-demo">
          <div class="demo-card">
            <div class="image-wrapper before" id="home-upload-zone" onclick="document.getElementById('home-file-main').click()" ondragover="app.handleDragOver(event)" ondrop="app.handleDrop(event)" style="cursor: pointer; position: relative;">
              <div class="upload-overlay" style="position: absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.7); z-index:10; text-align:center; padding:10px;">
                <span style="font-size: 24px;">➕</span>
                <p data-i18n="home_upload_hint" style="font-size:12px; margin-top:8px; color:var(--color-brown); font-weight:500;">사진을 끌어다 놓거나 클릭해서 시작하세요.</p>
              </div>
              <img id="home-preview-main" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=600" alt="Ordinary Photo" class="demo-img" style="opacity: 0.5; transition: opacity 0.3s;">
              <input type="file" id="home-file-main" accept="image/*" style="display:none" onchange="app.handleHomeUpload(event)">
            </div>
            <div class="arrow">→</div>
            <div class="image-wrapper after" style="position: relative;">
              <div class="preview-overlay" style="position: absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.4); z-index:10;">
                <p data-i18n="home_preview_hint" style="font-size:12px; font-weight:600; text-align:center; color:var(--color-brown);">AI Result Preview<br>Coming Soon</p>
              </div>
              <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400&h=600" alt="AI Portrait" class="demo-img" style="opacity: 0.3;">
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" id="btn-home-cta" onclick="app.handleHomeCtaClick()" data-i18n="btn_create_moment">나만의 순간 만들기</button>
          <button class="btn btn-secondary hide" onclick="app.navigate('upload')">Restore Memories</button>
        </div>"""

html = re.sub(r'        <div class="before-after-demo">.*?</div>\s*</section>', home_demo_replacement + '\n      </section>', html, flags=re.DOTALL)

# Add result screen buttons
result_actions_replacement = """        <div class="action-buttons result-actions">
          <button class="btn btn-primary" onclick="app.saveImage()" data-i18n="btn_save_high_res">고화질 저장하기 💎</button>
          <button class="btn btn-secondary" onclick="app.navigate('style')" data-i18n="btn_create_more">더 많은 스타일 만들기</button>
          <button class="btn btn-outline" onclick="app.shareImage()" data-i18n="btn_share">가족과 공유하기</button>
          <button class="btn btn-text" onclick="app.navigate('upload')" data-i18n="btn_recreate">다시 만들기</button>
        </div>"""

html = re.sub(r'        <div class="action-buttons result-actions">.*?</div>', result_actions_replacement, html, flags=re.DOTALL)

with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html")
