import re

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

home_handlers = """  handleDragOver: function(e) {
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
      
      // Update CTA button text
      const cta = document.getElementById('btn-home-cta');
      if (cta) {
        cta.setAttribute('data-i18n', 'btn_create_with_this');
        this.updateI18n(); // refresh text
      }

      // Auto transition after 0.5s
      setTimeout(() => {
        this.handleHomeCtaClick();
      }, 500);
    };
    reader.readAsDataURL(file);
  },

  handleHomeCtaClick: function() {
    this.navigate('upload');
    if (this.memoryProfile.main) {
      this.toggleProfileNext();
    }
  },

  handleProfileUpload"""

js = js.replace("  handleProfileUpload", home_handlers)

with open('/Users/devorah/connect/ReVowStudioAI/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated app.js")
