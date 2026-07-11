import re

with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

ratio_section = """
        <div class="option-group-header">
          <h3 data-i18n="ratio_title">어떤 비율로 출력할까요?</h3>
        </div>
        <div class="ratio-grid">
          <div class="ratio-card selected" onclick="app.selectAspectRatio('portrait_9_16', this)" id="ratio-portrait">
            <div class="ratio-icon"><div class="shape shape-portrait"></div></div>
            <div class="ratio-info">
              <h4 data-i18n="ratio_portrait">세로 (9:16)</h4>
              <p data-i18n="ratio_portrait_desc">모바일, 릴스, 쇼츠에 최적</p>
            </div>
          </div>
          <div class="ratio-card" onclick="app.selectAspectRatio('square_1_1', this)">
            <div class="ratio-icon"><div class="shape shape-square"></div></div>
            <div class="ratio-info">
              <h4 data-i18n="ratio_square">정방형 (1:1)</h4>
              <p data-i18n="ratio_square_desc">프로필, SNS 피드에 최적</p>
            </div>
          </div>
          <div class="ratio-card" onclick="app.selectAspectRatio('landscape_16_9', this)">
            <div class="ratio-icon"><div class="shape shape-landscape"></div></div>
            <div class="ratio-info">
              <h4 data-i18n="ratio_landscape">가로 (16:9)</h4>
              <p data-i18n="ratio_landscape_desc">웹사이트, PC, TV 표출용</p>
            </div>
          </div>
          <div class="ratio-card" onclick="app.selectAspectRatio('print_4_5', this)">
            <div class="ratio-icon"><div class="shape shape-print"></div></div>
            <div class="ratio-info">
              <h4 data-i18n="ratio_print">사진 인화용 (4:5)</h4>
              <p data-i18n="ratio_print_desc">액자, 실물 앨범 제작용</p>
            </div>
          </div>
        </div>

        <div class="bottom-action hide" id="generate-action">"""

html = html.replace('        <div class="bottom-action hide" id="generate-action">', ratio_section)

with open('/Users/devorah/connect/ReVowStudioAI/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html with ratio section")
