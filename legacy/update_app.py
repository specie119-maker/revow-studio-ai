import re

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add i18n variables to app object
js = re.sub(
    r'const app = {',
    "const app = {\n  currentLang: 'en',\n  translations: { ko: {}, en: {} },",
    js
)

# Add i18n methods
i18n_methods = """
  initLanguage: async function() {
    try {
      const resKo = await fetch('./locales/ko.json');
      this.translations.ko = await resKo.json();
      const resEn = await fetch('./locales/en.json');
      this.translations.en = await resEn.json();
    } catch (e) {
      console.error('Failed to load translations', e);
    }
    
    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    this.currentLang = browserLang.toLowerCase().includes('ko') ? 'ko' : 'en';
    this.updateI18n();
  },

  toggleLanguage: function() {
    this.currentLang = this.currentLang === 'ko' ? 'en' : 'ko';
    this.updateI18n();
  },

  updateI18n: function() {
    const t = this.translations[this.currentLang];
    if (!t) return;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.innerHTML = t[key];
      }
    });

    // Update Language Toggle Indicator
    const indicator = document.getElementById('lang-indicator');
    const other = document.getElementById('lang-other');
    if (indicator && other) {
      indicator.textContent = this.currentLang === 'ko' ? 'KO' : 'EN';
      other.textContent = this.currentLang === 'ko' ? 'EN' : 'KO';
    }
  },
"""

js = js.replace('navigate: function(viewId) {', i18n_methods + '\n  navigate: function(viewId) {')

# Find document loaded or service worker part to initialize i18n
if '// PWA Service Worker Registration' in js:
    js = js.replace(
        "// PWA Service Worker Registration",
        "// Initialize App\ndocument.addEventListener('DOMContentLoaded', () => {\n  app.initLanguage();\n});\n\n// PWA Service Worker Registration"
    )

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated app.js")
