const app = {
  currentLang: 'en',
  translations: { ko: {}, en: {} },
  currentView: 'home',
  memoryProfile: {
    main: null,
    additional: []
  },
  selectedAgeStyle: 'current',
  selectedStyle: 'modern_minimal',
  selectedAspectRatio: 'portrait_9_16',
  uploadedFile: null,
  outfitReferenceImage: null, // TODO: Send outfitReferenceImage with user photo to AI generation API later.
  customPromptText: '',

  // TODO: Connect selectedStyle to AI image generation prompt later.
  STYLE_PROMPTS: {
    classic_wedding: "Western wedding dress and tuxedo, elegant studio lighting",
    korean_hanbok: "Traditional Korean wedding hanbok, beautiful pastel colors",
    modern_minimal: "Elegant suit, dress, clean studio portrait, minimal background",
    japanese_wedding: "Japanese traditional wedding style, kimono, serene atmosphere",
    chinese_wedding: "Chinese traditional wedding style, red qipao, festive elegant",
    indian_wedding: "Indian traditional wedding style, ornate jewelry, vibrant colors",
    muslim_wedding: "Modest wedding attire, elegant covered dress style, beautiful hijab",
    custom_culture: "User described cultural outfit"
  },

  
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

  navigate: function(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    
    // Update bottom nav state if applicable
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Specific Nav highlights
    if (viewId === 'home') {
      document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (viewId === 'upload' || viewId === 'creating-profile' || viewId === 'profile-ready' || viewId === 'style' || viewId === 'generating' || viewId === 'result') {
      document.querySelectorAll('.nav-item')[1].classList.add('active');
    }

    // Show selected view
    const viewEl = document.getElementById(`view-${viewId}`);
    if (viewEl) {
      viewEl.classList.add('active');
      this.currentView = viewId;
    }
  },

  handleDragOver: function(e) {
    e.preventDefault();
    e.stopPropagation();
  },

  handleDrop: function(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      this.processHomeUpload(files[0]);
    }
  },

  handleHomeUpload: function(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      this.processHomeUpload(files[0]);
    }
  },

  processHomeUpload: function(file) {
    this.memoryProfile.main = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      
      // Update home preview
      const homePreview = document.getElementById('home-preview-main');
      if (homePreview) {
        homePreview.src = src;
        homePreview.style.opacity = '1';
      }
      
      const uploadOverlay = document.querySelector('#home-upload-zone .upload-overlay');
      if (uploadOverlay) {
        uploadOverlay.classList.add('hide');
      }

      // Update upload view preview
      const previewMain = document.getElementById('preview-main');
      if (previewMain) {
        previewMain.src = src;
        previewMain.classList.remove('hide');
      }
      
      // Ensure the button text is updated
      const cta = document.getElementById('btn-home-cta');
      if (cta) {
        cta.setAttribute('data-i18n', 'btn_create_with_this');
        this.updateI18n(); // refresh text
      }
    };
    reader.readAsDataURL(file);
  },

  handleHomeCtaClick: function() {
    this.navigate('upload');
    if (this.memoryProfile.main) {
      this.toggleProfileNext();
    }
  },

  handleProfileUpload: function(event, type) {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (type === 'additional') {
        for (let i = 0; i < files.length; i++) {
          this.memoryProfile.additional.push(files[i]);
        }
        // Show preview for the first additional file
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('preview-additional').src = e.target.result;
          document.getElementById('preview-additional').classList.remove('hide');
        };
        reader.readAsDataURL(files[0]);
      } else {
        const file = files[0];
        this.memoryProfile[type] = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById(`preview-${type}`).src = e.target.result;
          document.getElementById(`preview-${type}`).classList.remove('hide');
        };
        reader.readAsDataURL(file);
      }
      this.toggleProfileNext();
    }
  },

  toggleProfileNext: function() {
    const hasPhoto = this.memoryProfile.main !== null;
    const consent = document.getElementById('consent-check').checked;
    const btn = document.getElementById('btn-create-profile');
    const btnContainer = document.getElementById('btn-create-profile-container');
    
    if (hasPhoto && consent) {
      btn.disabled = false;
      if (btnContainer) btnContainer.classList.remove('hide');
    } else {
      btn.disabled = true;
      if (btnContainer) btnContainer.classList.add('hide');
    }
  },

  createMemoryProfile: function() {
    this.navigate('creating-profile');
    
    // Simulate Higgsfield profile creation
    // TODO: Connect Higgsfield API later
    setTimeout(() => {
      this.saveMemoryProfile();
      this.navigate('profile-ready');
    }, 2500);
  },

  saveMemoryProfile: function() {
    // Save the memory profile structure
    console.log("Memory Profile Saved:", {
      main: this.memoryProfile.main,
      additional: this.memoryProfile.additional,
      consent: document.getElementById('consent-check').checked
    });
  },

  selectMemoryProfile: function() {
    // Stub function for selecting saved profile
  },

  selectAgeStyle: function(ageId, element) {
    this.selectedAgeStyle = ageId;
    
    // Update UI selection
    document.querySelectorAll('.age-card').forEach(card => {
      card.classList.remove('selected');
    });
    element.classList.add('selected');
  },

  selectAspectRatio: function(ratio, element) {
    this.selectedAspectRatio = ratio;
    document.querySelectorAll('.ratio-card').forEach(card => {
      card.classList.remove('selected');
    });
    element.classList.add('selected');
  },

  selectOutfitStyle: function(styleId, element) {
    this.selectedStyle = styleId;
    
    // If a preset style is selected, clear any outfit reference
    if (this.outfitReferenceImage) {
      this.outfitReferenceImage = null;
      document.getElementById('outfit-file-input').value = '';
      document.getElementById('outfit-preview-container').classList.add('hide');
      document.getElementById('outfit-upload-box').classList.remove('hide');
    }

    // Update UI selection
    document.querySelectorAll('.style-card').forEach(card => {
      card.classList.remove('selected');
    });
    element.classList.add('selected');

    // Show Generate button
    document.getElementById('generate-action').classList.remove('hide');
  },

  updateCustomPrompt: function(text) {
    this.customPromptText = text;
  },

  handleOutfitUpload: function(event) {
    const file = event.target.files[0];
    if (file) {
      this.outfitReferenceImage = file;
      
      // Deselect preset styles
      this.selectedStyle = 'custom_outfit';
      document.querySelectorAll('.style-card').forEach(card => {
        card.classList.remove('selected');
      });
      document.getElementById('custom-culture-input').classList.add('hide');

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('outfit-preview-img').src = e.target.result;
        document.getElementById('outfit-upload-box').classList.add('hide');
        document.getElementById('outfit-preview-container').classList.remove('hide');
      };
      reader.readAsDataURL(file);

      // Show Generate button
      document.getElementById('generate-action').classList.remove('hide');
    }
  },

  removeOutfitReference: function(event) {
    event.stopPropagation();
    this.outfitReferenceImage = null;
    document.getElementById('outfit-file-input').value = '';
    
    // Hide preview, show upload box
    document.getElementById('outfit-preview-container').classList.add('hide');
    document.getElementById('outfit-upload-box').classList.remove('hide');
    
    // Re-select default preset (Modern Minimal)
    document.getElementById('style-modern').click();
  },

  generateDemoResult: function() {
    console.log("generateDemoResult started");
    if (!this.selectedStyle) {
      alert('Please select a style first.');
      return;
    }

    // Show generating view
    this.navigate('generating');

    console.log("memoryProfile loaded:", this.memoryProfile);
    console.log("Generating with parameters:", {
      age: this.selectedAgeStyle,
      style: this.selectedStyle,
      aspectRatio: this.selectedAspectRatio,
      outfitReference: this.outfitReferenceImage
    });

    setTimeout(() => {
      this.showResult();
    }, 3000);
  },

  showResult: function() {
    let demoResultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80";
    
    // Adjust aspect ratio styling
    let aspectRatioStyle = "9/16";
    if (this.selectedAspectRatio === 'square_1_1') {
      aspectRatioStyle = "1/1";
      demoResultImage += "&w=800&h=800";
    } else if (this.selectedAspectRatio === 'landscape_16_9') {
      aspectRatioStyle = "16/9";
      demoResultImage += "&w=800&h=450";
    } else if (this.selectedAspectRatio === 'print_4_5') {
      aspectRatioStyle = "4/5";
      demoResultImage += "&w=800&h=1000";
    } else {
      demoResultImage += "&w=450&h=800";
    }

    console.log("demo image assigned:", demoResultImage);
    
    // Update UI with demo image
    const container = document.querySelector('.result-image-container');
    if (container) {
      container.innerHTML = `<img src="${demoResultImage}" alt="AI Result" class="result-img" style="width:100%; aspect-ratio:${aspectRatioStyle}; object-fit:cover; border-radius:var(--border-radius); box-shadow:0 10px 30px rgba(0,0,0,0.1);">`;
    }

    // Transition from generating to result view
    this.navigate('result');
    console.log("result screen opened");
  }

  saveImage: function() {
    // TODO: Implement actual save image functionality
    alert('Image saved to your gallery!');
  },

  shareImage: function() {
    // TODO: Implement actual share functionality (Web Share API)
    if (navigator.share) {
      navigator.share({
        title: 'ReVow Studio AI',
        text: 'Check out my new AI Portrait!',
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      alert('Sharing is not supported on this browser.');
    }
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  app.initLanguage();
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
